import { accountNameKey, accountTypes, canonicalLocale, colours, contributionDelta, currencyDigits, defaultPreferences, hasLedgerAmounts, icons, isDate, maxLedgerAccounts, maximumAmount } from "./finance.ts"
import type { Budget, Category, Contribution, Data, Entry, Goal, LedgerAccount, Preferences } from "./finance.ts"

export const MAX_BYTES = 8 * 1024 * 1024
export const MAX_RECORDS = 10_000
const collections = ["categories", "entries", "budgets", "goals", "contributions"] as const
const keys = {
  categories: ["id", "name", "kind", "colour", "icon"],
  entries: ["id", "kind", "name", "amount", "date", "category", "account", "notes"],
  budgets: ["id", "category", "amount"],
  goals: ["id", "name", "amount", "date", "notes"],
  contributions: ["id", "goal", "amount", "date", "notes"],
}

function object(value: unknown, fields: readonly string[], label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`Invalid ${label}.`)
  const values = Object.entries(value)
  if (values.length !== fields.length || values.some(([key]) => !fields.includes(key))) {
    throw new Error(`Unexpected or missing fields in ${label}.`)
  }
  return value as Record<string, unknown>
}

function string(value: unknown, max: number, optional = false) {
  if (typeof value !== "string" || value.length > max || (!optional && !value.trim()) || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(value)) {
    throw new Error("A text field is missing, too long or contains unsupported characters.")
  }
  return value
}

function id(value: unknown) {
  const result = string(value, 64)
  if (!/^[a-zA-Z0-9_-]+$/.test(result)) throw new Error("A record identifier is invalid.")
  return result
}

function choice<T extends string>(value: unknown, options: readonly T[]): T {
  const result = options.find(option => option === value)
  if (result === undefined) throw new Error("A record contains an unsupported option.")
  return result
}

function amount(value: unknown, maximum: number) {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 1 || value > maximum) {
    throw new Error("A monetary amount is outside the supported range.")
  }
  return value
}

function targetAmount(value: unknown, maximum: number) {
  return value === null ? null : amount(value, maximum)
}

function contributionObject(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid contribution.")
  const fields = Object.keys(value)
  const legacy = ["id", "goal", "amount", "date", "notes"]
  const current = [...legacy.slice(0, 3), "direction", ...legacy.slice(3)]
  const matches = (expected: string[]) => fields.length === expected.length && expected.every(field => fields.includes(field))
  if (!matches(legacy) && !matches(current)) throw new Error("Unexpected or missing fields in contributions.")
  return value as Record<string, unknown>
}

function date(value: unknown, optional = false) {
  const result = string(value, 10, optional)
  if (!(optional && result === "") && !isDate(result)) throw new Error("A record contains an invalid date.")
  return result
}

export function parsePreferences(value: unknown): Preferences {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid preferences.")
  const row = value as Record<string, unknown>
  const legacy = ["currency", "theme", "reducedMotion"]
  const current = [...legacy, "currencyDigits", "locale", "dateFormat", "numberFormat", "currencyDisplay"]
  const fields = Object.keys(row)
  const oldPreferences = fields.length === legacy.length && legacy.every(field => fields.includes(field))
  if (!oldPreferences && (fields.length !== current.length || current.some(field => !fields.includes(field)))) {
    throw new Error("Unexpected or missing fields in preferences.")
  }
  const currency = typeof row.currency === "string" && /^[A-Z]{3}$/.test(row.currency) ? row.currency : ""
  if (!currency) throw new Error("A currency code must contain three uppercase letters.")
  let standardDigits: number
  try { standardDigits = currencyDigits(currency) } catch { throw new Error("A currency code is invalid.") }
  if (row.reducedMotion !== null && typeof row.reducedMotion !== "boolean") throw new Error("Invalid motion preference.")
  const locale = oldPreferences ? defaultPreferences.locale : canonicalLocale(typeof row.locale === "string" ? row.locale : "")
  if (!locale) throw new Error("The regional format locale is invalid.")
  const digits = oldPreferences ? standardDigits : row.currencyDigits
  if (typeof digits !== "number" || !Number.isInteger(digits) || digits < 0 || digits > 4) throw new Error("The currency precision is invalid.")
  if (digits !== standardDigits) throw new Error("The currency precision does not match the selected currency.")
  return {
    currency, currencyDigits: digits, locale,
    dateFormat: oldPreferences ? defaultPreferences.dateFormat : choice(row.dateFormat, ["regional", "dmy", "mdy", "ymd"] as const),
    numberFormat: oldPreferences ? defaultPreferences.numberFormat : choice(row.numberFormat, ["regional", "period", "comma", "space"] as const),
    currencyDisplay: oldPreferences ? defaultPreferences.currencyDisplay : choice(row.currencyDisplay, ["symbol", "code"] as const),
    theme: choice(row.theme, ["light", "dark", "system"]), reducedMotion: row.reducedMotion as boolean | null,
  }
}

export function validateData(input: unknown): Data {
  const hasAccounts = input !== null && typeof input === "object" && Object.hasOwn(input, "accounts")
  const fields = [...collections, "preferences"]
  const data = object(input, hasAccounts ? [...fields, "accounts"] : fields, "local data")
  const preferences = parsePreferences(data.preferences)
  const maximum = maximumAmount(preferences.currencyDigits)
  const accounts = hasAccounts ? validateAccounts(data.accounts, preferences) : []
  let count = accounts.length
  function read<K extends keyof typeof keys, T extends { id: string }>(key: K, readRow: (row: Record<string, unknown>) => T) {
    const rows = data[key]
    if (!Array.isArray(rows) || (count += rows.length) > MAX_RECORDS) throw new Error(`A backup can contain up to ${MAX_RECORDS.toLocaleString("en")} records.`)
    const ids = new Set<string>()
    return rows.map(value => {
      const row = readRow(object(value, keys[key], key))
      if (ids.has(row.id)) throw new Error(`Duplicate record ID in ${key}.`)
      ids.add(row.id)
      return row
    })
  }
  const kind = (value: unknown) => choice(value, ["expense", "income"] as const)
  const categories = read("categories", (v): Category => ({ id: id(v.id), name: string(v.name, 70), kind: kind(v.kind), colour: choice(v.colour, colours), icon: choice(v.icon, icons) }))
  const entries = read("entries", (v): Entry => ({ id: id(v.id), kind: kind(v.kind), name: string(v.name, 120), amount: amount(v.amount, maximum), date: date(v.date), category: id(v.category), account: string(v.account, 70), notes: string(v.notes, 500, true) }))
  const budgets = read("budgets", (v): Budget => ({ id: id(v.id), category: id(v.category), amount: amount(v.amount, maximum) }))
  const goals = read("goals", (v): Goal => ({ id: id(v.id), name: string(v.name, 90), amount: targetAmount(v.amount, maximum), date: date(v.date, true), notes: string(v.notes, 500, true) }))
  const contributions = data.contributions
  if (!Array.isArray(contributions) || (count += contributions.length) > MAX_RECORDS) throw new Error(`A backup can contain up to ${MAX_RECORDS.toLocaleString("en")} records.`)
  const contributionIds = new Set<string>()
  const transfers = contributions.map(value => {
    const v = contributionObject(value)
    const row: Contribution = {
      id: id(v.id), goal: id(v.goal), amount: amount(v.amount, maximum), direction: "direction" in v ? choice(v.direction, ["deposit", "withdrawal"] as const) : "deposit",
      date: date(v.date), notes: string(v.notes, 500, true),
    }
    if (contributionIds.has(row.id)) throw new Error("Duplicate record ID in contributions.")
    contributionIds.add(row.id)
    return row
  })
  const categoryMap = new Map(categories.map(item => [item.id, item.kind]))
  const goalIds = new Set(goals.map(goal => goal.id))
  const names = new Set(categories.map(category => `${category.kind}:${category.name.trim().normalize("NFKC").toLowerCase()}`))
  if (names.size !== categories.length) throw new Error("A category with this name already exists for this transaction type.")
  if (entries.some(entry => categoryMap.get(entry.category) !== entry.kind)) throw new Error("A transaction has a missing or incompatible category.")
  if (budgets.some(budget => categoryMap.get(budget.category) !== "expense")) throw new Error("A budget requires an expense category.")
  if (new Set(budgets.map(budget => budget.category)).size !== budgets.length) throw new Error("A budget already exists for that category.")
  if (transfers.some(row => !goalIds.has(row.goal))) throw new Error("A transfer refers to a missing savings pot.")
  const transfersByPot = new Map<string, Contribution[]>()
  for (const transfer of transfers) {
    const rows = transfersByPot.get(transfer.goal) ?? []
    rows.push(transfer)
    transfersByPot.set(transfer.goal, rows)
  }
  for (const rows of transfersByPot.values()) {
    rows.sort((a, b) => a.date.localeCompare(b.date) || (a.direction === b.direction ? 0 : a.direction === "deposit" ? -1 : 1))
    let balance = 0
    for (const transfer of rows) {
      balance += contributionDelta(transfer)
      if (balance < 0) throw new Error("A withdrawal cannot exceed the savings pot balance on its date.")
    }
  }
  return { entries, categories, budgets, goals, contributions: transfers, preferences, ...(accounts.length ? { accounts } : {}) }
}

export function validateAccounts(value: unknown, preferences: Preferences): LedgerAccount[] {
  if (!Array.isArray(value) || value.length > maxLedgerAccounts) throw new Error(`A ledger can contain up to ${maxLedgerAccounts} accounts.`)
  const maximum = maximumAmount(preferences.currencyDigits)
  const ids = new Set<string>()
  const names = new Set<string>()
  return value.map(input => {
    const row = object(input, ["id", "name", "type", "openingBalance"], "account")
    const recordId = id(row.id)
    const name = string(row.name, 70).trim()
    const nameKey = accountNameKey(name)
    const balance = row.openingBalance
    if (/[\r\n\t]/u.test(name)) throw new Error("An account name must fit on one line.")
    if (ids.has(recordId) || names.has(nameKey)) throw new Error("An account with this name already exists.")
    if (typeof balance !== "number" || !Number.isSafeInteger(balance) || Math.abs(balance) > maximum) throw new Error("An opening balance is outside the supported range.")
    ids.add(recordId)
    names.add(nameKey)
    return { id: recordId, name, type: choice(row.type, accountTypes), openingBalance: balance }
  })
}

export function serialiseBackup(data: Data) {
  const validated = validateData(data)
  const text = JSON.stringify({ app: "money-manager", version: validated.accounts ? 3 : 2, data: validated })
  if (new TextEncoder().encode(text).length > MAX_BYTES) throw new Error("This ledger is too large for an 8 MB backup. Remove some records or shorten long notes.")
  return text
}

export function parseBackup(text: string) {
  if (new TextEncoder().encode(text).length > MAX_BYTES) throw new Error("Choose a backup no larger than 8 MB.")
  // Bound work before parsing and reject repeated keys that JSON.parse would silently overwrite.
  const scopes: Array<Set<string> | null> = []
  let containers = 0
  let separators = 0
  let start = -1
  let escaped = false
  for (let index = 0; index < text.length; index++) {
    const char = text[index]
    if (start >= 0) {
      if (escaped) { escaped = false; continue }
      if (char === "\\") { escaped = true; continue }
      if (char !== '"') continue
      const scope = scopes.at(-1)
      if (scope) {
        let after = index + 1
        while (after < text.length && /[ \t\r\n]/.test(text[after])) after++
        if (text[after] === ":") {
          if (index - start > 64) throw new Error("The backup contains an oversized field name.")
          let key: string
          try { key = JSON.parse(text.slice(start, index + 1)) } catch {
            throw new Error("The backup contains an invalid field name.")
          }
          if (scope.has(key)) throw new Error("The backup contains a repeated field name.")
          scope.add(key)
        }
      }
      start = -1
      continue
    }
    if (char === '"') start = index
    else if (char === "{" || char === "[") {
      if (++containers > MAX_RECORDS + 16) throw new Error("The backup contains too many records or containers.")
      if (scopes.length >= 6) throw new Error("The backup contains too many nested levels.")
      scopes.push(char === "{" ? new Set() : null)
    } else if (char === "}" || char === "]") scopes.pop()
    else if (char === "," && ++separators > MAX_RECORDS * 8 + 24) {
      throw new Error("The backup contains too many values.")
    }
  }
  let root: unknown
  try { root = JSON.parse(text) } catch { throw new Error("The backup could not be read as JSON.") }
  const file = object(root, ["app", "version", "data"], "backup file")
  if (file.app !== "money-manager" || (file.version !== 1 && file.version !== 2 && file.version !== 3)) throw new Error("This Money Manager backup format is unsupported.")
  return validateData(file.data)
}

export function combineBackup(current: Data, imported: Data): Data {
  if (hasLedgerAmounts(current) && hasLedgerAmounts(imported) &&
    (current.preferences.currency !== imported.preferences.currency || current.preferences.currencyDigits !== imported.preferences.currencyDigits)) {
    throw new Error("The backup and local records use different currencies. Restore the backup instead, or use a file in the current currency.")
  }
  function merge<T extends { id: string }>(existing: T[], incoming: T[], label: string) {
    const index = new Map(existing.map(row => [row.id, row]))
    for (const row of incoming) {
      const match = index.get(row.id)
      if (match && JSON.stringify(match) !== JSON.stringify(row)) throw new Error(`A ${label} conflicts with a record already on this device.`)
      index.set(row.id, row)
    }
    return Array.from(index.values())
  }
  const hasCurrentAmounts = hasLedgerAmounts(current)
  return validateData({
    categories: merge(current.categories, imported.categories, "category"),
    entries: merge(current.entries, imported.entries, "transaction"),
    budgets: merge(current.budgets, imported.budgets, "budget"),
    goals: merge(current.goals, imported.goals, "goal"),
    contributions: merge(current.contributions, imported.contributions, "contribution"),
    accounts: merge(current.accounts ?? [], imported.accounts ?? [], "account"),
    preferences: {
      ...current.preferences,
      ...(hasCurrentAmounts ? {} : { currency: imported.preferences.currency, currencyDigits: imported.preferences.currencyDigits }),
    },
  })
}
