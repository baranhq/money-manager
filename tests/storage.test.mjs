import "fake-indexeddb/auto"
import assert from "node:assert/strict"
import { test } from "node:test"
import { readData, updateData } from "../src/lib/storage.ts"
import { initialData } from "../src/lib/finance.ts"

test("IndexedDB persists changes, serialises concurrent writes, and rolls back invalid writes", async () => {
  assert.deepEqual(await readData(), initialData())
  const add = (id) => updateData(data => ({ ...data, goals: [...data.goals, { id, name: id, amount: 100, date: "", notes: "" }] }))
  await Promise.all([add("one"), add("two")])
  const before = await readData()
  assert.deepEqual(before.goals.map(goal => goal.id).sort(), ["one", "two"])
  await assert.rejects(updateData(data => ({ ...data, goals: [{ ...data.goals[0], amount: 0 }] })))
  assert.deepEqual(await readData(), before)
})

test("corrupted records remain in place until explicit recovery, which preserves readable appearance preferences", async () => {
  const { InvalidSnapshot, readPreferences, recoverData, storageName } = await import("../src/lib/storage.ts")
  const preferences = { currency: "EUR", theme: "dark", reducedMotion: true }
  await updateData(data => ({ ...data, preferences }))
  assert.deepEqual(await readPreferences(), preferences)

  await new Promise((resolve, reject) => {
    const request = indexedDB.open(storageName, 1)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction("snapshots", "readwrite")
      transaction.objectStore("snapshots").put({ preferences, entries: "invalid" }, "current")
      transaction.oncomplete = () => { db.close(); resolve() }
      transaction.onabort = () => { db.close(); reject(transaction.error) }
    }
  })
  await assert.rejects(readData(), InvalidSnapshot)
  await assert.rejects(updateData(() => initialData()), InvalidSnapshot)
  assert.deepEqual(await readPreferences(), preferences)
  await recoverData()
  assert.deepEqual(await readData(), { ...initialData(), preferences })
  await assert.rejects(recoverData(), /storage changed/i)
})
