import assert from "node:assert/strict"
import { test } from "node:test"
import { amountFromText, initialData, monthTotals } from "../src/lib/finance.ts"
import { parseBackup, serialiseBackup, combineBackup, MAX_BYTES } from "../src/lib/backup.ts"

const entry = { id: "entry-1", kind: "expense", name: "Coffee", amount: 10, date: "2026-11-20", category: "dining", account: "Cash", notes: "" }

test("decimal input and monthly totals use integer minor units", () => {
  assert.equal(amountFromText("0.10") + amountFromText("0.20"), 30)
  for (const bad of ["1e4", "-1", "1.001", "0", "999999999999999999"]) assert.throws(() => amountFromText(bad))
  const data = initialData()
  data.entries = [entry, { ...entry, id: "entry-2", amount: 20 }, { ...entry, id: "entry-3", date: "2026-10-31" }]
  assert.deepEqual(monthTotals(data, "2026-11"), { income: 0, spent: 30, saved: 0, balance: -30 })
})

test("backup round-trips and merges without duplicating IDs", () => {
  const data = initialData()
  data.entries = [entry]
  assert.deepEqual(parseBackup(serialiseBackup(data)), data)
  assert.equal(combineBackup(data, data).entries.length, 1)
  assert.throws(() => combineBackup(data, { ...data, entries: [{ ...entry, amount: 15 }] }), /conflict/i)
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
  assert.throws(() => parseBackup(valid.replace('"version":1', '"version":99,"versi\\u006fn":1')), /repeated/i)
  assert.throws(() => parseBackup("[" + Array(10_020).fill("{}").join(",") + "]"), /too many/i)
})
