import assert from "node:assert/strict"
import { test } from "node:test"
import { amountFromText, currencyDigits, defaultPreferences, goalSaved, goalSavedByGoal, initialData, maximumAmount, money, monthTotals, spending } from "../src/lib/finance.ts"
import { parseBackup, serialiseBackup, combineBackup, MAX_BYTES } from "../src/lib/backup.ts"

const entry = { id: "entry-1", kind: "expense", name: "Coffee", amount: 10, date: "2026-11-20", category: "dining", account: "Cash", notes: "" }

test("decimal input and monthly totals use integer minor units", () => {
  assert.equal(amountFromText("0.10", defaultPreferences) + amountFromText("0.20", defaultPreferences), 30)
  for (const bad of ["1e4", "-1", "1.001", "0", "999999999999999999"]) assert.throws(() => amountFromText(bad, defaultPreferences))
  const data = initialData()
  data.entries = [entry, { ...entry, id: "entry-2", amount: 20 }, { ...entry, id: "entry-3", date: "2026-10-31" }]
  assert.deepEqual(monthTotals(data, "2026-11"), { income: 0n, spent: 30n, saved: 0n, balance: -30n })
})

test("backup round-trips and merges without duplicating IDs", () => {
  const data = initialData()
  data.entries = [entry]
  assert.deepEqual(parseBackup(serialiseBackup(data)), data)
  assert.equal(combineBackup(data, data).entries.length, 1)
  assert.throws(() => combineBackup(data, { ...data, entries: [{ ...entry, amount: 15 }] }), /conflict/i)
})

test("backup currency precision matches the selected currency", () => {
  const data = initialData()
  const backup = JSON.parse(serialiseBackup(data))
  backup.data.preferences.currencyDigits = 4
  assert.throws(() => parseBackup(JSON.stringify(backup)), /precision.*currency/i)

  const yen = { ...data, preferences: { ...data.preferences, currency: "JPY", currencyDigits: 0 } }
  assert.equal(parseBackup(serialiseBackup(yen)).preferences.currencyDigits, 0)
})

test("savings balances aggregate deposits and withdrawals by pot and reporting month", () => {
  const data = initialData()
  data.contributions = [
    { id: "transfer-1", goal: "holiday", amount: 12_500, direction: "deposit", date: "2026-11-03", notes: "" },
    { id: "transfer-2", goal: "holiday", amount: 2_500, direction: "withdrawal", date: "2026-11-20", notes: "" },
    { id: "transfer-3", goal: "emergency", amount: 8_000, direction: "deposit", date: "2026-12-01", notes: "" },
  ]

  assert.deepEqual([...goalSavedByGoal(data, "2026-11")], [["holiday", 10_000n]])
  assert.equal(goalSavedByGoal(data).get("emergency"), 8_000n)
  assert.equal(goalSaved(data, "holiday", "2026-11"), 10_000n)
})

test("large supported-currency aggregates preserve every minor unit", () => {
  const data = initialData()
  const digits = currencyDigits("CLF")
  const amount = maximumAmount(digits)
  const total = BigInt(amount) * 1_000n
  data.preferences = { ...data.preferences, currency: "CLF", currencyDigits: digits }
  data.entries = Array.from({ length: 1_000 }, (_, index) => ({
    ...entry,
    id: `entry-${index}`,
    amount,
  }))
  data.contributions = Array.from({ length: 1_000 }, (_, index) => ({
    id: `transfer-${index}`,
    goal: "holiday",
    amount,
    direction: "deposit",
    date: "2026-11-20",
    notes: "",
  }))

  assert.equal(monthTotals(data, "2026-11").spent, total)
  assert.equal(monthTotals(data, "2026-11").saved, total)
  assert.equal(monthTotals(data, "2026-11").balance, -total * 2n)
  assert.equal(spending(data, "2026-11").get("dining"), total)
  assert.equal(goalSavedByGoal(data).get("holiday"), total)
  assert.equal(goalSaved(data, "holiday"), total)
  assert.ok(money(total, { ...data.preferences, currencyDisplay: "code" }).endsWith("999,999,999,999.9000"))
})

test("exact currency formatting preserves existing locale output", () => {
  for (const [currency, locale, display] of [
    ["EUR", "en-GB", "symbol"],
    ["JPY", "ja-JP", "symbol"],
    ["BHD", "ar-BH", "symbol"],
    ["CLF", "fr-FR", "code"],
  ]) {
    const digits = currencyDigits(currency)
    const preferences = { ...defaultPreferences, currency, currencyDigits: digits, locale, currencyDisplay: display }
    const scale = 10 ** digits
    const formatter = new Intl.NumberFormat(locale, {
      style: "currency", currency, currencyDisplay: display,
      minimumFractionDigits: digits, maximumFractionDigits: digits,
    })
    for (const amount of [0, 1, -1, 1_234_567, -1_234_567]) {
      const expected = formatter.format(amount / scale)
      assert.equal(money(amount, preferences), expected)
      assert.equal(money(BigInt(amount), preferences), expected)
    }
  }
})

test("backup pot validation keeps large deposit and withdrawal balances exact", () => {
  const data = initialData()
  const digits = currencyDigits("CLF")
  const amount = maximumAmount(digits)
  data.preferences = { ...data.preferences, currency: "CLF", currencyDigits: digits }
  data.goals = [{ id: "holiday", name: "Holiday", amount: null, date: "", notes: "" }]
  data.contributions = [
    ...Array.from({ length: 1_000 }, (_, index) => ({
      id: `deposit-${index}`, goal: "holiday", amount, direction: "deposit", date: "2026-01-01", notes: "",
    })),
    ...Array.from({ length: 1_000 }, (_, index) => ({
      id: `withdrawal-${index}`, goal: "holiday", amount, direction: "withdrawal", date: "2026-01-02", notes: "",
    })),
  ]
  const backup = JSON.parse(serialiseBackup(data))
  backup.data.contributions.push({
    id: "overdraw", goal: "holiday", amount: 1, direction: "withdrawal", date: "2026-01-03", notes: "",
  })

  assert.throws(() => parseBackup(JSON.stringify(backup)), /withdrawal cannot exceed/)
})

test("backup rejects malformed, incompatible, oversized and unsafe input", () => {
  const data = initialData()
  for (const input of ["{", "[".repeat(20), '{"__proto__":{"polluted":true}}', '{"version":2}', " ".repeat(MAX_BYTES + 1)]) {
    assert.throws(() => parseBackup(input))
  }
  const invalid = [
    { ...entry, date: "2026-02-30" },
    { ...entry, amount: 1.25 },
    { ...entry, category: "absent" },
    { ...entry, name: "x".repeat(500) },
  ]
  for (const invalidEntry of invalid) {
    assert.throws(() => parseBackup(JSON.stringify({ app: "money-manager", version: 1, data: { ...data, entries: [invalidEntry] } })))
  }
  assert.equal(Object.prototype.polluted, undefined)
})

test("backup rejects too many records, duplicate identifiers and an incompatible ledger currency", () => {
  const data = initialData()
  assert.throws(() => serialiseBackup({ ...data, entries: Array(10_001).fill(entry) }), /10,000/)
  assert.throws(() => serialiseBackup({ ...data, entries: [entry, entry] }), /duplicate/i)
  data.entries = [entry]
  assert.throws(() => combineBackup(data, { ...data, preferences: { ...data.preferences, currency: "USD" } }), /currencies/)
})

test("backup rejects repeated keys and an excess of JSON containers before schema validation", () => {
  const valid = serialiseBackup(initialData())
  const version = JSON.parse(valid).version
  assert.throws(() => parseBackup(valid.replace(`"version":${version}`, '"version":99,"versi\\u006fn":1')), /repeated/i)
  assert.throws(() => parseBackup("[" + Array(10_020).fill("{}").join(",") + "]"), /too many/i)
})
