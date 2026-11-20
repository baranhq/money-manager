import { defaultPreferences, initialData, type Data, type Preferences } from "./finance.ts"
import { parsePreferences, serialiseBackup, validateData } from "./backup.ts"

export const storageName = "money-manager"
export class InvalidSnapshot extends Error {}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(storageName, 1)
    let blocked = false
    request.onupgradeneeded = () => request.result.createObjectStore("snapshots")
    request.onsuccess = () => {
      if (blocked) request.result.close()
      else resolve(request.result)
    }
    request.onerror = () => reject(request.error)
    request.onblocked = () => {
      blocked = true
      reject(new Error("Close other Money Manager tabs and try again."))
    }
  })
}

async function transact<T>(mode: IDBTransactionMode, operation: (raw: unknown, store: IDBObjectStore) => T, key = "current") {
  const db = await openDatabase()
  try {
    return await new Promise<T>((resolve, reject) => {
      const transaction = db.transaction("snapshots", mode)
      const store = transaction.objectStore("snapshots")
      let result: T
      let failure: unknown
      transaction.oncomplete = () => resolve(result)
      transaction.onabort = () => reject(failure ?? transaction.error ?? new Error("The local save was interrupted."))
      const read = store.get(key)
      read.onsuccess = () => {
        try {
          result = operation(read.result, store)
        } catch (error) {
          failure = error
          transaction.abort()
        }
      }
    })
  } finally {
    db.close()
  }
}

function snapshot(raw: unknown): Data {
  if (raw === undefined) return initialData()
  try { return validateData(raw) } catch {
    throw new InvalidSnapshot("The saved records could not be validated. They are still on this device.")
  }
}

export function readData() {
  return transact("readonly", raw => snapshot(raw))
}

export function readPreferences() {
  return transact<Preferences>("readonly", raw => raw === undefined ? defaultPreferences : parsePreferences(raw), "preferences")
}

function writeSnapshot(store: IDBObjectStore, data: Data) {
  // Reject unexportable ledgers before either local write is committed.
  serialiseBackup(data)
  store.put(data, "current")
  store.put(data.preferences, "preferences")
}

export function updateData(change: (current: Data) => Data) {
  return transact("readwrite", (raw, store) => {
    const updated = validateData(change(snapshot(raw)))
    writeSnapshot(store, updated)
    return updated
  })
}

export function recoverData(replacement?: Data) {
  return transact("readwrite", (raw, store) => {
    try {
      snapshot(raw)
    } catch (error) {
      if (!(error instanceof InvalidSnapshot)) throw error
      const updated = replacement ? validateData(replacement) : initialData()
      if (raw && typeof raw === "object" && "preferences" in raw) {
        try {
          const preferences = parsePreferences(raw.preferences)
          updated.preferences = { ...preferences, currency: updated.preferences.currency }
        } catch { /* The corrupted preferences cannot be retained. */ }
      }
      writeSnapshot(store, updated)
      return updated
    }
    throw new Error("Storage changed while this action was open. Reload your records.")
  })
}
