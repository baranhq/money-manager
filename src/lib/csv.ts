import { MAX_BYTES, MAX_RECORDS, validateData } from "./backup.ts"
import { amountFromText, exactAmount, isDate, type Data, type Entry } from "./finance.ts"

const headers = ["id", "date", "type", "description", "amount", "currency", "category", "account", "notes"]
const formula = /^[\s\uFEFF]*[=+\-@＝＋－＠]|^[\t\r\n]/u

function field(value: string) {
  const protectedValue = formula.test(value) || value.startsWith("'") ? "'" + value : value
  return '"' + protectedValue.replaceAll('"', '""') + '"'
}

function unprotect(value: string) {
  const rest = value.slice(1)
  return value.startsWith("'") && (rest.startsWith("'") || formula.test(rest)) ? rest : value
}

export function exportCsv(data: Data, start: string, end: string) {
  if (!isDate(start) || !isDate(end) || end < start) throw new Error("Choose a valid start and end date.")
  const names = new Map(data.categories.map(category => [category.id, category.name]))
  const rows = data.entries.filter(row => row.date >= start && row.date <= end)
  if (!rows.length) throw new Error("There are no transactions in this date range.")
  return [
    headers.join(","),
    ...rows.map(row => [row.id, row.date, row.kind, row.name, exactAmount(row.amount), data.preferences.currency, names.get(row.category) ?? "", row.account, row.notes].map(field).join(",")),
  ].join("\r\n")
}

function readRows(text: string) {
  if (new TextEncoder().encode(text).length > MAX_BYTES) throw new Error("Choose a CSV file no larger than 8 MB.")
  const rows: string[][] = []
  let row: string[] = []
  let value = ""
  let state: "plain" | "quoted" | "closed" = "plain"
  function addField() {
    if (row.length >= headers.length) throw new Error("A CSV row has too many columns.")
    row.push(value)
    value = ""
    state = "plain"
  }
  function addRow() {
    addField()
    if (row.length !== 1 || row[0]) rows.push(row)
    row = []
    if (rows.length > MAX_RECORDS + 1) throw new Error("The CSV contains too many rows.")
  }
  for (let index = text.charCodeAt(0) === 0xfeff ? 1 : 0; index < text.length; index++) {
    const char = text[index]
    if (state === "quoted") {
      if (char === '"' && text[index + 1] === '"') { value += '"'; index++ }
      else if (char === '"') state = "closed"
      else value += char
    } else if (char === ",") addField()
    else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[index + 1] === "\n") index++
      addRow()
    } else if (state === "closed") throw new Error("Unexpected text after a quoted CSV field.")
    else if (char === '"' && value === "") state = "quoted"
    else if (char === '"') throw new Error("Quote the entire CSV field when it contains quotes.")
    else value += char
    if (value.length > 501) throw new Error("A CSV field is too long.")
  }
  if (state === "quoted") throw new Error("A CSV field has an unfinished quotation.")
  if (row.length || value || state === "closed") addRow()
  return rows
}

export function importCsv(text: string, data: Data) {
  const [header, ...rows] = readRows(text)
  const withId = header?.length === headers.length
  const expected = withId ? headers : headers.slice(1)
  if (!header || header.length !== expected.length || !expected.every((key, index) => key === header[index].trim().toLowerCase())) {
    throw new Error("Use the column headings from a Money Manager CSV export. The id column is optional.")
  }
  const entries: Entry[] = []
  const records = new Map(data.entries.map(row => [row.id, row]))
  const categories = new Map(data.categories.map(category => [`${category.kind}:${category.name.trim().normalize("NFKC").toLowerCase()}`, category.id]))
  const signature = ({ kind, name, amount, date, category, account, notes }: Entry) => JSON.stringify([kind, name, amount, date, category, account, notes])
  const signatures = new Set(data.entries.map(signature))
  let duplicates = 0
  for (const [index, cells] of rows.entries()) {
    try {
      if (cells.length !== expected.length) throw new Error("The column count does not match the header.")
      const values = cells.map(unprotect)
      const [date, kind, name, rawAmount, currency, categoryName, account, notes] = withId ? values.slice(1) : values
      if (!isDate(date)) throw new Error("Use a valid date in YYYY-MM-DD format.")
      if (kind !== "expense" && kind !== "income") throw new Error("Type must be expense or income.")
      if (currency !== data.preferences.currency) throw new Error(`Currency must match the ledger (${data.preferences.currency}).`)
      const category = categories.get(`${kind}:${categoryName.trim().normalize("NFKC").toLowerCase()}`)
      if (!category) throw new Error("The category does not exist for this transaction type.")
      const id = (withId && values[0]) || crypto.randomUUID()
      const entry: Entry = { id, date, kind, name, amount: amountFromText(rawAmount), category, account, notes }
      const existing = records.get(id)
      if (existing && signature(entry) !== signature(existing)) throw new Error("This ID conflicts with another transaction.")
      if (existing || (!withId && signatures.has(signature(entry)))) {
        duplicates++
        continue
      }
      records.set(id, entry)
      signatures.add(signature(entry))
      entries.push(entry)
    } catch (error) {
      throw new Error(`Row ${index + 2}: ${error instanceof Error ? error.message : "Invalid transaction."}`)
    }
  }
  validateData({ ...data, entries: [...data.entries, ...entries] })
  return { entries, duplicates }
}
