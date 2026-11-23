import assert from "node:assert/strict"
import test from "node:test"
import { assertRecordSetUnchanged, removeRecordIfUnchanged, updateRecordIfUnchanged } from "../src/lib/finance.ts"

test("record edits reject a concurrent change even when the ID remains", () => {
  const original = { id: "entry-1", name: "Coffee", amount: 450, date: "2026-11-23" }
  const changed = { ...original, amount: 500 }
  const replacement = { ...original, name: "Cafe" }

  assert.throws(
    () => updateRecordIfUnchanged([changed], original, replacement, "transaction"),
    /This transaction changed in another tab\. Reopen this form\./,
  )
})

test("record edits reject a concurrent deletion instead of recreating it", () => {
  const original = { id: "budget-1", category: "groceries", amount: 50_000 }

  assert.throws(
    () => updateRecordIfUnchanged([], original, { ...original, amount: 75_000 }, "budget"),
    /This budget was removed in another tab\./,
  )
})

test("record edits replace the row when no concurrent change occurred", () => {
  const original = { id: "goal-1", name: "Holiday", amount: 200_000, date: "2027-06-01", notes: "" }
  const replacement = { ...original, amount: 250_000 }
  const rows = [{ id: "unrelated", name: "Emergency", amount: null, date: "", notes: "" }, { ...original }]

  assert.deepEqual(
    updateRecordIfUnchanged(rows, original, replacement, "savings pot"),
    [rows[0], replacement],
  )
})

test("record deletion rejects a concurrent edit instead of deleting the latest row", () => {
  const original = { id: "transfer-1", goal: "holiday", amount: 2_500, direction: "withdrawal", date: "2026-11-20", notes: "" }
  const changed = { ...original, amount: 1_500 }

  assert.throws(
    () => removeRecordIfUnchanged([changed], original, "transfer"),
    /This transfer changed in another tab\. Reopen this form\./,
  )
})

test("record deletion removes the row when it is still the reviewed value", () => {
  const original = { id: "budget-1", category: "groceries", amount: 50_000 }
  const unrelated = { id: "budget-2", category: "transport", amount: 25_000 }

  assert.deepEqual(removeRecordIfUnchanged([unrelated, { ...original }], original, "budget"), [unrelated])
})

test("deleting a pot detects changes to its transfers even when the count is unchanged", () => {
  const original = [{ id: "transfer-1", goal: "holiday", amount: 2_500, direction: "withdrawal", date: "2026-11-20", notes: "" }]
  const changed = [{ ...original[0], amount: 1_500 }]

  assert.throws(
    () => assertRecordSetUnchanged(changed, original, "transfer"),
    /This transfer changed in another tab\. Reopen this form\./,
  )
})
