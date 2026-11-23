import assert from "node:assert/strict"
import { test } from "node:test"
import { IDBFactory } from "fake-indexeddb"
import { combineBackup, parseBackup, serialiseBackup } from "../src/lib/backup.ts"
import { initialData, monthTotals, openingBalanceFromText } from "../src/lib/finance.ts"
import { initialOnboarding, parseOnboarding } from "../src/lib/onboarding.ts"
import { finishOnboarding, readWorkspace, saveOnboarding, updateData } from "../src/lib/storage.ts"

test("setup persists a draft, commits once across tabs, and leaves existing financial records alone", async () => {
  const original = globalThis.indexedDB
  globalThis.indexedDB = new IDBFactory()
  try {
    const fresh = await readWorkspace()
    assert.deepEqual(fresh.onboarding, initialOnboarding())
    const editor = { type: "Bank", name: "Everyday", balance: "-20.50" }
    const legacyDraft = { ...fresh.onboarding, step: "accounts", showPreferences: true, editor }
    const draft = { ...fresh.onboarding, editor: { ...editor, showBalance: true } }
    assert.deepEqual(parseOnboarding(legacyDraft), draft)
    assert.equal(await saveOnboarding(draft), true)
    assert.deepEqual((await readWorkspace()).onboarding, draft)
    const blankBalance = { ...draft, editor: { ...editor, balance: "", showBalance: true } }
    assert.equal(await saveOnboarding(blankBalance), true)
    assert.deepEqual((await readWorkspace()).onboarding, blankBalance)
    await assert.rejects(finishOnboarding(draft, false), /add or cancel/i)
    const openingBalance = openingBalanceFromText(draft.editor.balance, draft.preferences)
    assert.equal(openingBalance, -2050)
    const saved = { ...draft, editor: null, accounts: [{ id: "everyday", type: "Bank", name: "Everyday", openingBalance }] }
    const results = await Promise.all([finishOnboarding(saved, false), finishOnboarding(initialOnboarding(), true)])
    assert.equal(results.filter(result => result.applied).length, 1)
    const complete = await readWorkspace()
    assert.equal(complete.onboarding, undefined)
    assert.deepEqual(complete.data.accounts, saved.accounts)
    assert.equal(await saveOnboarding(draft), false)
    assert.deepEqual(parseBackup(serialiseBackup(complete.data)), complete.data)
    assert.equal(combineBackup(complete.data, complete.data).accounts.length, 1)
    assert.equal(monthTotals(complete.data, "2026-11").income, 0)

    globalThis.indexedDB = new IDBFactory()
    const skipped = await finishOnboarding({ ...saved, preferences: { ...saved.preferences, currency: "USD" } }, true)
    assert.equal(skipped.applied, true)
    assert.deepEqual(skipped.workspace.data, { ...initialData(), preferences: initialOnboarding().preferences })
    assert.equal((await readWorkspace()).onboarding, undefined)
    assert.equal(await saveOnboarding(draft), false)

    globalThis.indexedDB = new IDBFactory()
    const ledger = initialData()
    ledger.entries.push({ id: "old", kind: "expense", date: "2026-11-20", name: "Existing record", amount: 25, category: "dining", account: "Cash", notes: "" })
    await updateData(() => ledger)
    assert.equal((await finishOnboarding(saved, false)).applied, false)
    assert.deepEqual((await readWorkspace()).data, ledger)
  } finally { globalThis.indexedDB = original }
})
