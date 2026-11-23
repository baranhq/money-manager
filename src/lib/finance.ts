export const colours = ["green", "blue", "orange", "purple", "rose", "grey"] as const
export const icons = ["wallet", "basket", "utensils", "bus", "home", "heart", "bolt", "briefcase"] as const
export const profileColours = ["green", "blue", "orange", "purple", "rose", "teal", "amber", "slate"] as const
export const profileIcons = ["user", "home", "company", "bank", "briefcase", "wallet", "shop", "group"] as const
export const MAX_PROFILES = 50
export type Currency = string
export type Theme = "light" | "dark" | "system"
export type DateFormat = "regional" | "dmy" | "mdy" | "ymd"
export type NumberFormat = "regional" | "period" | "comma" | "space"
export type CurrencyDisplay = "symbol" | "code"
export type Kind = "expense" | "income"
export type ProfileColour = typeof profileColours[number]
export type ProfileIcon = typeof profileIcons[number]
export type Profile = { id: string; name: string; colour: ProfileColour; icon: ProfileIcon }
export type NewProfile = Omit<Profile, "id">
export type Category = { id: string; name: string; kind: Kind; colour: typeof colours[number]; icon: typeof icons[number] }
export type Entry = { id: string; kind: Kind; name: string; amount: number; date: string; category: string; account: string; notes: string }
export const accountTypes = ["Cash", "Bank", "Other"] as const
export type AccountType = typeof accountTypes[number]
export type LedgerAccount = { id: string; name: string; type: AccountType; openingBalance: number }
export const maxLedgerAccounts = 100
export type Budget = { id: string; category: string; amount: number }
export type Goal = { id: string; name: string; amount: number | null; date: string; notes: string }
export type ContributionDirection = "deposit" | "withdrawal"
export type Contribution = { id: string; goal: string; amount: number; direction: ContributionDirection; date: string; notes: string }
export type Preferences = {
  currency: Currency
  currencyDigits: number
  locale: string
  dateFormat: DateFormat
  numberFormat: NumberFormat
  currencyDisplay: CurrencyDisplay
  theme: Theme
  reducedMotion: boolean | null
}
export type Data = {
  entries: Entry[]
  accounts?: LedgerAccount[]
  categories: Category[]
  budgets: Budget[]
  goals: Goal[]
  contributions: Contribution[]
  preferences: Preferences
}

export function hasLedgerAmounts(data: Data) {
  return Boolean(data.entries.length || data.budgets.length || data.goals.length || data.contributions.length ||
    data.accounts?.some(account => account.openingBalance !== 0))
}

export function accountNameKey(name: string) {
  return name.trim().normalize("NFKC").toLowerCase()
}

export const defaultProfile: Profile = { id: "personal", name: "Personal", colour: "green", icon: "user" }

const currencyValues = typeof Intl.supportedValuesOf === "function"
  ? Intl.supportedValuesOf("currency")
  : ["EUR", "BGN", "USD", "GBP", "TRY", "CHF", "CAD", "AUD"]
export const currencies: readonly Currency[] = [...new Set([...currencyValues, "BGN", "CLF", "UYW"])].sort()

export function currencyDigits(currency: Currency) {
  return new Intl.NumberFormat("en", { style: "currency", currency }).resolvedOptions().maximumFractionDigits ?? 2
}

export function canonicalLocale(value: string) {
  try {
    const locales = Intl.getCanonicalLocales(value.trim())
    return locales.length === 1 ? locales[0] : undefined
  } catch { return undefined }
}

export const MAX_MAJOR_AMOUNT = 999_999_999
export const MAX_AMOUNT = (MAX_MAJOR_AMOUNT + 1) * 100 - 1
export const defaultPreferences: Preferences = {
  currency: "EUR", currencyDigits: currencyDigits("EUR"), locale: "en-GB", dateFormat: "regional",
  numberFormat: "regional", currencyDisplay: "symbol", theme: "light", reducedMotion: null,
}

export function maximumAmount(digits: number) {
  return (MAX_MAJOR_AMOUNT + 1) * 10 ** digits - 1
}

function hasSameRecordValues<T extends object>(current: T, original: T) {
  const originalKeys = Object.keys(original) as (keyof T)[]
  const currentKeys = Object.keys(current) as (keyof T)[]
  return currentKeys.length === originalKeys.length && originalKeys.every(key =>
    Object.hasOwn(current, key) && current[key] === original[key])
}

function requireUnchangedRecord<T extends { id: string }>(rows: readonly T[], original: T, label: string) {
  const current = rows.find(item => item.id === original.id)
  if (!current) throw new Error(`This ${label} was removed in another tab.`)
  if (!hasSameRecordValues(current, original)) {
    throw new Error(`This ${label} changed in another tab. Reopen this form.`)
  }
  return current
}

export function updateRecordIfUnchanged<T extends { id: string }>(rows: readonly T[], original: T, replacement: T, label: string): T[] {
  requireUnchangedRecord(rows, original, label)
  return rows.map(item => item.id === original.id ? replacement : item)
}

export function removeRecordIfUnchanged<T extends { id: string }>(rows: readonly T[], original: T, label: string): T[] {
  requireUnchangedRecord(rows, original, label)
  return rows.filter(item => item.id !== original.id)
}

export function assertRecordSetUnchanged<T extends { id: string }>(rows: readonly T[], originals: readonly T[], label: string) {
  if (rows.length !== originals.length) {
    throw new Error(`These ${label}s changed in another tab. Reopen this confirmation.`)
  }
  const originalsById = new Map(originals.map(original => [original.id, original]))
  if (originalsById.size !== originals.length) throw new Error(`These ${label}s changed in another tab. Reopen this confirmation.`)
  const seen = new Set<string>()
  for (const current of rows) {
    const original = originalsById.get(current.id)
    if (!original || seen.has(current.id)) throw new Error(`These ${label}s changed in another tab. Reopen this confirmation.`)
    seen.add(current.id)
    if (!hasSameRecordValues(current, original)) throw new Error(`This ${label} changed in another tab. Reopen this form.`)
  }
}

export function initialData(): Data {
  return {
    entries: [], budgets: [], goals: [], contributions: [],
    preferences: { ...defaultPreferences },
    categories: [
      { id: "home", name: "Home", kind: "expense", colour: "green", icon: "home" },
      { id: "groceries", name: "Groceries", kind: "expense", colour: "green", icon: "basket" },
      { id: "dining", name: "Eating out", kind: "expense", colour: "orange", icon: "utensils" },
      { id: "transport", name: "Transport", kind: "expense", colour: "blue", icon: "bus" },
      { id: "personal", name: "Personal", kind: "expense", colour: "purple", icon: "wallet" },
      { id: "health", name: "Health", kind: "expense", colour: "rose", icon: "heart" },
      { id: "utilities", name: "Utilities", kind: "expense", colour: "orange", icon: "bolt" },
      { id: "other", name: "Other", kind: "expense", colour: "grey", icon: "wallet" },
      { id: "salary", name: "Salary", kind: "income", colour: "green", icon: "briefcase" },
      { id: "other-income", name: "Other income", kind: "income", colour: "grey", icon: "wallet" },
    ],
  }
}

function numberSeparators(locale: string, format: NumberFormat) {
  const parts = new Intl.NumberFormat(locale, { useGrouping: true, minimumFractionDigits: 1, maximumFractionDigits: 1 })
    .formatToParts(1_234_567.8)
  const localeGroup = parts.find(part => part.type === "group")?.value ?? ","
  const localeDecimal = parts.find(part => part.type === "decimal")?.value ?? "."
  const grouping = new Intl.NumberFormat(locale, { useGrouping: true, maximumFractionDigits: 0 })
    .formatToParts(1_234_567_890_123).filter(part => part.type === "integer").map(part => part.value.length).reverse()
  const primaryGroupSize = grouping[0] ?? 3
  const secondaryGroupSize = grouping[1] ?? primaryGroupSize
  if (format === "period") return { group: ",", decimal: ".", primaryGroupSize: 3, secondaryGroupSize: 3 }
  if (format === "comma") return { group: ".", decimal: ",", primaryGroupSize: 3, secondaryGroupSize: 3 }
  if (format === "space") return { group: "\u202f", decimal: ",", primaryGroupSize: 3, secondaryGroupSize: 3 }
  return { group: localeGroup, decimal: localeDecimal, primaryGroupSize, secondaryGroupSize }
}

function localizedDigits(value: string, locale: string) {
  const formatter = new Intl.NumberFormat(locale, { useGrouping: false, maximumFractionDigits: 0 })
  let result = value
  for (let digit = 0; digit <= 9; digit++) {
    const localDigit = formatter.formatToParts(digit).filter(part => part.type === "integer").map(part => part.value).join("")
    if (localDigit !== String(digit)) result = result.replaceAll(localDigit, String(digit))
  }
  return result
}

function localizeNumberParts(parts: Intl.NumberFormatPart[], preferences: Preferences) {
  const separators = numberSeparators(preferences.locale, preferences.numberFormat)
  return parts.map(part => part.type === "group" ? separators.group : part.type === "decimal" ? separators.decimal : part.value).join("")
}

export function amountFromText(input: string, preferences: Preferences, decimalSeparator?: string, allowGrouping = true, allowZero = false) {
  const separators = numberSeparators(preferences.locale, preferences.numberFormat)
  const decimal = decimalSeparator ?? separators.decimal
  let value = localizedDigits(input.trim(), preferences.locale)
  const group = allowGrouping ? separators.group : ""
  if (group && /[\s\u00a0\u202f]/u.test(group)) value = value.replace(/[ \u00a0\u202f]/gu, group)
  const pieces = value.split(decimal)
  const fraction = pieces.length === 2 ? pieces[1] : ""
  if (pieces.length > 2 || (pieces.length === 2 && (!fraction || preferences.currencyDigits === 0))) {
    throw new Error(preferences.currencyDigits === 0 ? "This currency does not use decimal places." : `Use ${decimal} as the decimal separator.`)
  }
  let whole = pieces[0]
  if (group && whole.includes(group)) {
    const groups = whole.split(group)
    const reversed = groups.slice(1).reverse()
    const validGrouping = groups.every(part => /^\d+$/.test(part)) &&
      groups[0].length > 0 && groups[0].length <= separators.secondaryGroupSize &&
      reversed.every((part, index) => part.length === (index === 0 ? separators.primaryGroupSize : separators.secondaryGroupSize))
    if (!validGrouping) throw new Error("Check the thousands separators in this amount.")
    whole = groups.join("")
  }
  if (!/^\d{1,9}$/.test(whole) || (pieces.length === 2 && !/^\d+$/.test(fraction)) || fraction.length > preferences.currencyDigits) {
    throw new Error(preferences.currencyDigits === 0 ? "Enter a whole amount with no decimal places." : `Enter an amount with up to ${preferences.currencyDigits} decimal places.`)
  }
  const scale = 10 ** preferences.currencyDigits
  const amount = Number(whole) * scale + Number(fraction.padEnd(preferences.currencyDigits, "0"))
  if (amount < (allowZero ? 0 : 1) || amount > maximumAmount(preferences.currencyDigits)) throw new Error("Enter an amount greater than zero and below one billion.")
  return amount
}

export function openingBalanceFromText(input: string, preferences: Preferences) {
  const text = input.trim()
  if (!text) return 0
  const negative = /^[-−]/u.test(text)
  const amount = amountFromText(negative ? text.slice(1) : text, preferences, undefined, true, true)
  return negative && amount !== 0 ? -amount : amount
}

export function exactAmount(amount: number, preferences: Preferences) {
  const scale = 10 ** preferences.currencyDigits
  const whole = Math.trunc(amount / scale)
  const fraction = preferences.currencyDigits ? `.${String(amount % scale).padStart(preferences.currencyDigits, "0")}` : ""
  return `${whole}${fraction}`
}

export function amountInput(amount: number, preferences: Preferences) {
  const scale = 10 ** preferences.currencyDigits
  const parts = new Intl.NumberFormat(preferences.locale, {
    useGrouping: false, minimumFractionDigits: preferences.currencyDigits, maximumFractionDigits: preferences.currencyDigits,
  }).formatToParts(amount / scale)
  return localizeNumberParts(parts, preferences)
}

export function money(amount: number | bigint, preferences: Preferences) {
  const minorUnits = typeof amount === "bigint" ? amount : BigInt(amount)
  const digits = preferences.currencyDigits
  const scale = 10n ** BigInt(digits)
  const magnitude = minorUnits < 0n ? -minorUnits : minorUnits
  const whole = magnitude / scale
  const remainder = magnitude % scale
  const formatter = new Intl.NumberFormat(preferences.locale, {
    style: "currency", currency: preferences.currency, currencyDisplay: preferences.currencyDisplay,
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  })
  const digitFormatter = new Intl.NumberFormat(preferences.locale, { useGrouping: false, maximumFractionDigits: 0 })
  let parts = formatter.formatToParts(minorUnits < 0n ? -whole : whole)
  if (minorUnits < 0n && whole === 0n) {
    const zero = digitFormatter.format(0n)
    parts = formatter.formatToParts(-1n).map(part => part.type === "integer" ? { ...part, value: zero } : part)
  }
  if (digits > 0) {
    const decimal = new Intl.NumberFormat(preferences.locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
      .formatToParts(1.1).find(part => part.type === "decimal")?.value ?? "."
    const fraction = remainder.toString().padStart(digits, "0")
      .split("").map(digit => digitFormatter.format(BigInt(digit))).join("")
    const lastInteger = parts.findLastIndex(part => part.type === "integer")
    parts.splice(lastInteger + 1, 0, { type: "decimal", value: decimal }, { type: "fraction", value: fraction })
  }
  return localizeNumberParts(parts, preferences)
}

export function compactMoney(amount: number | bigint, preferences: Preferences) {
  const scale = 10 ** preferences.currencyDigits
  const parts = new Intl.NumberFormat(preferences.locale, {
    style: "currency", currency: preferences.currency, currencyDisplay: preferences.currencyDisplay,
    notation: "compact", minimumFractionDigits: 0, maximumFractionDigits: 1,
  }).formatToParts(Number(amount) / scale)
  return localizeNumberParts(parts, preferences)
}

export function today() {
  const date = new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

export function isDate(value: string) {
  if (!/^[1-9]\d{3}-\d{2}-\d{2}$/.test(value)) return false
  const parsed = new Date(value)
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().startsWith(value)
}

export function shiftMonth(month: string, offset: number) {
  const [year, number] = month.split("-").map(Number)
  return new Date(Date.UTC(year, number - 1 + offset, 1)).toISOString().slice(0, 7)
}

export function dateLabel(date: string, options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }, preferences: Preferences = defaultPreferences) {
  if (preferences.dateFormat !== "regional" && options.day && options.month && options.year && !options.weekday) {
    const [year, month, day] = date.split("-")
    if (preferences.dateFormat === "dmy") return `${day}/${month}/${year}`
    if (preferences.dateFormat === "mdy") return `${month}/${day}/${year}`
    return `${year}-${month}-${day}`
  }
  return new Intl.DateTimeFormat(preferences.locale, { ...options, timeZone: "UTC" }).format(new Date(date))
}

export function monthName(month: string, short = false, preferences: Preferences = defaultPreferences) {
  return dateLabel(`${month}-01`, { month: short ? "short" : "long", year: "numeric" }, preferences)
}

export function weekStart(locale: string) {
  const region = new Intl.Locale(locale) as Intl.Locale & { getWeekInfo?: () => { firstDay: number } }
  const firstDay = region.getWeekInfo?.().firstDay
  return firstDay === undefined ? 0 : firstDay % 7
}

export function monthTotals(data: Data, month: string) {
  let income = 0n
  let spent = 0n
  for (const entry of data.entries) {
    if (!entry.date.startsWith(month)) continue
    const amount = BigInt(entry.amount)
    if (entry.kind === "income") income += amount
    else spent += amount
  }
  const saved = savingsMovement(data, month).net
  return { income, spent, saved, balance: income - spent - saved }
}

export function contributionDelta(contribution: Pick<Contribution, "amount" | "direction">) {
  const amount = BigInt(contribution.amount)
  return contribution.direction === "withdrawal" ? -amount : amount
}

export function savingsMovement(data: Data, month: string) {
  let added = 0n
  let withdrawn = 0n
  for (const contribution of data.contributions) {
    if (!contribution.date.startsWith(month)) continue
    const amount = BigInt(contribution.amount)
    if (contribution.direction === "withdrawal") withdrawn += amount
    else added += amount
  }
  return { added, withdrawn, net: added - withdrawn }
}

export function goalSaved(data: Data, goal: string, month?: string) {
  return goalSavedByGoal(data, month).get(goal) ?? 0n
}

export function goalSavedByGoal(data: Data, month?: string) {
  const balances = new Map<string, bigint>()
  for (const row of data.contributions) {
    if (month && row.date.slice(0, 7) > month) continue
    balances.set(row.goal, (balances.get(row.goal) ?? 0n) + contributionDelta(row))
  }
  return balances
}

export function spending(data: Data, month: string) {
  const totals = new Map<string, bigint>()
  for (const entry of data.entries) {
    if (entry.kind === "expense" && entry.date.startsWith(month)) {
      totals.set(entry.category, (totals.get(entry.category) ?? 0n) + BigInt(entry.amount))
    }
  }
  return totals
}

export function percent(amount: number | bigint, target: number | bigint) {
  const exactAmount = typeof amount === "bigint" ? amount : BigInt(amount)
  const exactTarget = typeof target === "bigint" ? target : BigInt(target)
  if (exactTarget <= 0n) return 0
  const numerator = exactAmount * 100n
  const quotient = numerator / exactTarget
  const remainder = numerator % exactTarget
  const rounded = remainder < 0n
    ? (-remainder * 2n > exactTarget ? quotient - 1n : quotient)
    : (remainder * 2n >= exactTarget ? quotient + 1n : quotient)
  return Number(rounded)
}

export function upsert<T extends { id: string }>(rows: T[], record: T) {
  return rows.some(row => row.id === record.id)
    ? rows.map(row => row.id === record.id ? record : row)
    : [...rows, record]
}
