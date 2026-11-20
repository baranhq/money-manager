export const currencies = ["EUR", "BGN", "USD", "GBP", "TRY", "CHF", "CAD", "AUD"] as const
export const colours = ["green", "blue", "orange", "purple", "rose", "grey"] as const
export const icons = ["wallet", "basket", "utensils", "bus", "home", "heart", "bolt", "briefcase"] as const
export const profileColours = ["green", "blue", "orange", "purple", "rose", "teal", "amber", "slate"] as const
export const profileIcons = ["user", "home", "company", "bank", "briefcase", "wallet", "shop", "group"] as const
export const MAX_PROFILES = 50
export type Currency = typeof currencies[number]
export type Theme = "light" | "dark" | "system"
export type Kind = "expense" | "income"
export type ProfileColour = typeof profileColours[number]
export type ProfileIcon = typeof profileIcons[number]
export type Profile = { id: string; name: string; colour: ProfileColour; icon: ProfileIcon }
export type NewProfile = Omit<Profile, "id">
export type Category = { id: string; name: string; kind: Kind; colour: typeof colours[number]; icon: typeof icons[number] }
export type Entry = { id: string; kind: Kind; name: string; amount: number; date: string; category: string; account: string; notes: string }
export type Budget = { id: string; category: string; amount: number }
export type Goal = { id: string; name: string; amount: number | null; date: string; notes: string }
export type ContributionDirection = "deposit" | "withdrawal"
export type Contribution = { id: string; goal: string; amount: number; direction: ContributionDirection; date: string; notes: string }
export type Preferences = { currency: Currency; theme: Theme; reducedMotion: boolean | null }
export type Data = {
  entries: Entry[]
  categories: Category[]
  budgets: Budget[]
  goals: Goal[]
  contributions: Contribution[]
  preferences: Preferences
}

export const defaultProfile: Profile = { id: "personal", name: "Personal", colour: "green", icon: "user" }

export const MAX_AMOUNT = 99_999_999_999
export const defaultPreferences: Preferences = { currency: "EUR", theme: "light", reducedMotion: null }

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

export function amountFromText(input: string) {
  const match = /^(\d{1,9})(?:[.,](\d{1,2}))?$/.exec(input.trim())
  if (!match) throw new Error("Enter an amount with up to two decimal places.")
  const amount = Number(match[1]) * 100 + Number((match[2] ?? "").padEnd(2, "0"))
  if (amount < 1 || amount > MAX_AMOUNT) throw new Error("Enter an amount greater than zero and below one billion.")
  return amount
}

export function exactAmount(amount: number) {
  return `${Math.trunc(amount / 100)}.${String(amount % 100).padStart(2, "0")}`
}

export function money(amount: number, currency: Currency) {
  return new Intl.NumberFormat("en-IE", { style: "currency", currency }).format(amount / 100)
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

export function dateLabel(date: string, options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) {
  return new Intl.DateTimeFormat("en-GB", { ...options, timeZone: "UTC" }).format(new Date(date))
}

export function monthName(month: string, short = false) {
  return dateLabel(`${month}-01`, { month: short ? "short" : "long", year: "numeric" })
}

export function monthTotals(data: Data, month: string) {
  let income = 0
  let spent = 0
  for (const entry of data.entries) {
    if (!entry.date.startsWith(month)) continue
    if (entry.kind === "income") income += entry.amount
    else spent += entry.amount
  }
  const saved = savingsMovement(data, month).net
  return { income, spent, saved, balance: income - spent - saved }
}

export function contributionDelta(contribution: Pick<Contribution, "amount" | "direction">) {
  return contribution.direction === "withdrawal" ? -contribution.amount : contribution.amount
}

export function savingsMovement(data: Data, month: string) {
  let added = 0
  let withdrawn = 0
  for (const contribution of data.contributions) {
    if (!contribution.date.startsWith(month)) continue
    if (contribution.direction === "withdrawal") withdrawn += contribution.amount
    else added += contribution.amount
  }
  return { added, withdrawn, net: added - withdrawn }
}

export function goalSaved(data: Data, goal: string, month?: string) {
  return data.contributions.reduce((sum, row) =>
    row.goal === goal && (!month || row.date.slice(0, 7) <= month) ? sum + contributionDelta(row) : sum, 0)
}

export function spending(data: Data, month: string) {
  const totals = new Map<string, number>()
  for (const entry of data.entries) {
    if (entry.kind === "expense" && entry.date.startsWith(month)) {
      totals.set(entry.category, (totals.get(entry.category) ?? 0) + entry.amount)
    }
  }
  return totals
}

export function percent(amount: number, target: number) {
  return target > 0 ? Math.round(amount * 100 / target) : 0
}

export function upsert<T extends { id: string }>(rows: T[], record: T) {
  return rows.some(row => row.id === record.id)
    ? rows.map(row => row.id === record.id ? record : row)
    : [...rows, record]
}
