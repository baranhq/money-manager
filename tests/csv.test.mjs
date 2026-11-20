import assert from "node:assert/strict"
import { test } from "node:test"
import { initialData } from "../src/lib/finance.ts"
import { exportCsv, importCsv } from "../src/lib/csv.ts"

test("CSV round-trips, neutralises formulas, and skips exact duplicates", () => {
  const data = initialData()
  const entry = { id: "id", kind: "expense", name: '=1+1, "Coffee"', amount: 123, date: "2026-11-20", category: "dining", account: "Cash", notes: "Line one\nLine two" }
  data.entries = [entry]
  const csv = exportCsv(data, "2026-11-01", "2026-11-30")
  assert.match(csv, /'=1\+1/)
  assert.deepEqual(importCsv(csv, { ...data, entries: [] }).entries, [entry])
  assert.equal(importCsv(csv, data).duplicates, 1)
  assert.throws(() => importCsv(csv, { ...data, entries: [{ ...entry, amount: 124 }] }), /conflict/i)
  assert.throws(() => importCsv(csv.replace("2026-11-20", "2026-02-30"), data), /date/i)
})
