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
  await assert.rejects(updateData(data => ({ ...data, goals: [{ ...data.goals[0], amount: -1 }] })))
  assert.deepEqual(await readData(), before)
})

test("corrupted records remain in place until explicit recovery, which preserves readable appearance preferences", async () => {
  const { InvalidSnapshot, readPreferences, recoverData, storageName } = await import("../src/lib/storage.ts")
  const preferences = { currency: "EUR", theme: "dark", reducedMotion: true }
  const normalizedPreferences = { ...initialData().preferences, ...preferences }
  await updateData(data => ({ ...data, preferences }))
  assert.deepEqual(await readPreferences(), normalizedPreferences)

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
  assert.deepEqual(await readPreferences(), normalizedPreferences)
  await recoverData()
  assert.deepEqual(await readData(), { ...initialData(), preferences: normalizedPreferences })
  await assert.rejects(recoverData(), /storage changed/i)
})

test("site password protects access and optional encrypted storage survives migration, reload and recovery", async () => {
  const security = await import("../src/lib/storage.ts")
  const password = "a-safe-local-passphrase-for-testing"
  const personalGoal = { id: "personal-pot", name: "Personal reserve", amount: 500, date: "", notes: "private personal note" }
  await updateData(data => ({ ...data, goals: [...data.goals, personalGoal] }))
  const family = await security.createProfile({ name: "Family", colour: "blue", icon: "home" })
  await updateData(data => ({ ...data, goals: [...data.goals, { id: "family-pot", name: "Family reserve", amount: 250, date: "", notes: "private family note" }] }))
  await security.switchProfile("personal")
  const before = await security.readWorkspace()

  await security.setupSitePassword(password, false)
  assert.deepEqual(await security.readSecurityStatus(), { configured: true, storageEncrypted: false })
  assert.equal(JSON.stringify(await readAllStorageRows()).includes(password), false)
  security.lockSite()
  await assert.rejects(security.unlockSitePassword("wrong-password-for-testing"), /password/i)
  await security.unlockSitePassword(password)
  assert.deepEqual(await security.readWorkspace(), before)

  const beforeMigration = await security.readSecurityStatus()
  await assert.rejects(security.setLocalStorageEncryption("wrong-password-for-testing", true), /password/i)
  assert.deepEqual(await security.readSecurityStatus(), beforeMigration)

  await security.setLocalStorageEncryption(password, true)
  assert.deepEqual(await security.readSecurityStatus(), { configured: true, storageEncrypted: true })
  const encryptedRows = await readAllStorageRows()
  assert.deepEqual(encryptedRows.map(([key]) => key).sort(), ["local-vault", "security"])
  assert.doesNotMatch(JSON.stringify(encryptedRows), /Personal reserve|Family reserve|private personal note|private family note/u)

  security.lockSite()
  await assert.rejects(security.readWorkspace(), /locked/i)
  const lockedRows = await readAllStorageRows()
  await assert.rejects(security.unlockSitePassword("wrong-password-for-testing"), /password/i)
  assert.deepEqual(await readAllStorageRows(), lockedRows)
  const validVault = lockedRows.find(([key]) => key === "local-vault")?.[1]
  assert.ok(validVault)
  const tamperedCiphertext = `${validVault.ciphertext[0] === "A" ? "B" : "A"}${validVault.ciphertext.slice(1)}`
  await writeStorageValue("local-vault", { ...validVault, ciphertext: tamperedCiphertext })
  await assert.rejects(security.unlockSitePassword(password), /encrypted local storage could not be opened/i)
  assert.deepEqual(await security.readSecurityStatus(), { configured: true, storageEncrypted: true })
  await writeStorageValue("local-vault", validVault)
  await security.unlockSitePassword(password)
  assert.deepEqual(await security.readWorkspace(), before)

  await Promise.all([
    updateData(data => ({ ...data, goals: [...data.goals, { id: "encrypted-one", name: "One", amount: null, date: "", notes: "" }] })),
    updateData(data => ({ ...data, goals: [...data.goals, { id: "encrypted-two", name: "Two", amount: null, date: "", notes: "" }] })),
  ])
  assert.deepEqual((await security.readWorkspace()).data.goals.map(goal => goal.id).filter(id => id.startsWith("encrypted-")).sort(), ["encrypted-one", "encrypted-two"])

  await security.switchProfile(family.activeProfileId)
  assert.equal((await security.readWorkspace()).data.goals[0].name, "Family reserve")
  await security.setLocalStorageEncryption(password, false)
  assert.deepEqual(await security.readSecurityStatus(), { configured: true, storageEncrypted: false })
  assert.equal((await readAllStorageRows()).some(([key]) => key === "local-vault"), false)
  await security.switchProfile("personal")
  assert.equal((await security.readWorkspace()).data.goals.some(goal => goal.name === "Personal reserve"), true)

  await security.removeSitePassword(password)
  assert.deepEqual(await security.readSecurityStatus(), { configured: false, storageEncrypted: false })
  assert.equal((await security.readWorkspace()).data.goals.some(goal => goal.id === "encrypted-one"), true)
})

test("encrypted storage unlocks into the corruption recovery path and preserves the active profile", async () => {
  const security = await import("../src/lib/storage.ts")
  const crypto = await import("../src/lib/security.ts")
  const password = "recovery-local passphrase 2026"
  await security.readWorkspace()
  await security.setupSitePassword(password, true)
  const savedWorkspace = await security.readWorkspace()
  const expected = initialData()
  expected.preferences = savedWorkspace.data.preferences

  const rows = await readAllStorageRows()
  const config = rows.find(([key]) => key === "security")?.[1]
  const vault = rows.find(([key]) => key === "local-vault")?.[1]
  assert.ok(config && vault)
  const key = await crypto.deriveEncryptionKey(password, crypto.decodeSalt(config.salt))
  const plaintext = crypto.openBytes(key, "Money Manager local storage v1", vault, 64 * 1024 * 1024)
  try {
    const image = new Map(JSON.parse(new TextDecoder().decode(plaintext)))
    image.set("current", { entries: "invalid ledger" })
    const bytes = new TextEncoder().encode(JSON.stringify([...image.entries()]))
    try {
      await writeStorageValue("local-vault", { version: 1, revision: vault.revision + 1, ...crypto.sealBytes(key, "Money Manager local storage v1", bytes) })
    } finally { bytes.fill(0) }
  } finally { plaintext.fill(0); key.fill(0) }

  security.lockSite()
  await security.unlockSitePassword(password)
  await assert.rejects(security.readWorkspace(), error =>
    error instanceof security.InvalidSnapshot && error.activeProfileId === "personal" && error.profiles?.some(profile => profile.id === "personal"),
  )
  assert.deepEqual(await security.recoverData(initialData(), "personal"), expected)
  assert.deepEqual((await security.readWorkspace()).data, expected)
  await security.removeSitePassword(password)
})

function readAllStorageRows() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("money-manager", 1)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction("snapshots", "readonly")
      const store = transaction.objectStore("snapshots")
      const keys = store.getAllKeys()
      const values = store.getAll()
      transaction.oncomplete = () => {
        db.close()
        resolve(keys.result.map((key, index) => [key, values.result[index]]))
      }
      transaction.onabort = () => {
        db.close()
        reject(transaction.error)
      }
    }
  })
}

function writeStorageValue(key, value) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("money-manager", 1)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction("snapshots", "readwrite")
      transaction.objectStore("snapshots").put(value, key)
      transaction.oncomplete = () => { db.close(); resolve() }
      transaction.onabort = () => { db.close(); reject(transaction.error) }
    }
  })
}
