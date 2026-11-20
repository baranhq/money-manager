import { defaultPreferences, defaultProfile, initialData, MAX_PROFILES, profileColours, profileIcons, type Data, type NewProfile, type Preferences, type Profile } from "./finance.ts"
import { parsePreferences, serialiseBackup, validateData } from "./backup.ts"

export const storageName = "money-manager"
export class InvalidSnapshot extends Error {
  profiles?: Profile[]
  activeProfileId?: string
}

const profileListKey = "profiles"
const activeProfileKey = "active-profile"
const currentDataKey = "current"
const preferencesKey = "preferences"
const profileDataKey = (id: string) => `profile-data:${id}`
export type Workspace = { profiles: Profile[]; activeProfileId: string; data: Data }

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

function transact<T>(mode: IDBTransactionMode, operation: (
  store: IDBObjectStore, complete: (value: T) => void, fail: (error: unknown) => void,
) => void) {
  return openDatabase().then(db => new Promise<T>((resolve, reject) => {
    const transaction = db.transaction("snapshots", mode)
    const store = transaction.objectStore("snapshots")
    let result: T
    let hasResult = false
    let failure: unknown
    transaction.oncomplete = () => {
      if (hasResult) resolve(result)
      else reject(new Error("The local save finished without a result."))
    }
    transaction.onabort = () => reject(failure ?? transaction.error ?? new Error("The local save was interrupted."))
    const complete = (value: T) => { result = value; hasResult = true }
    const fail = (error: unknown) => {
      failure = error
      try { transaction.abort() } catch { reject(error) }
    }
    try { operation(store, complete, fail) } catch (error) { fail(error) }
  }).finally(() => db.close()))
}

function readValues(store: IDBObjectStore, keys: string[], ready: (values: Map<string, unknown>) => void, fail: (error: unknown) => void) {
  const values = new Map<string, unknown>()
  let remaining = keys.length
  if (!remaining) { ready(values); return }
  for (const key of keys) {
    const request = store.get(key)
    request.onsuccess = () => {
      if (request.result !== undefined) values.set(key, request.result)
      if (--remaining === 0) {
        try { ready(values) } catch (error) { fail(error) }
      }
    }
    request.onerror = () => fail(request.error ?? new Error("The local data could not be read."))
  }
}

function readValue(store: IDBObjectStore, key: string, ready: (value: unknown) => void, fail: (error: unknown) => void) {
  const request = store.get(key)
  request.onsuccess = () => {
    try { ready(request.result) } catch (error) { fail(error) }
  }
  request.onerror = () => fail(request.error ?? new Error("The local data could not be read."))
}

function snapshot(raw: unknown): Data {
  if (raw === undefined) return initialData()
  try { return validateData(raw) } catch {
    throw new InvalidSnapshot("The saved records could not be validated. They are still on this device.")
  }
}

function parseProfile(value: unknown): Profile {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("A saved profile is invalid.")
  const row = value as Record<string, unknown>
  if (Object.keys(row).length !== 4 || !["id", "name", "colour", "icon"].every(key => key in row)) {
    throw new Error("A saved profile has unexpected or missing fields.")
  }
  if (typeof row.id !== "string" || !/^[a-zA-Z0-9_-]{1,64}$/.test(row.id)) throw new Error("A saved profile identifier is invalid.")
  if (typeof row.name !== "string" || row.name.length > 40 || /[\u0000-\u001f\u007f]/u.test(row.name) || !row.name.trim()) {
    throw new Error("A profile name must contain between 1 and 40 supported characters.")
  }
  if (typeof row.colour !== "string" || !profileColours.includes(row.colour as Profile["colour"])) throw new Error("A saved profile colour is invalid.")
  if (typeof row.icon !== "string" || !profileIcons.includes(row.icon as Profile["icon"])) throw new Error("A saved profile icon is invalid.")
  return { id: row.id, name: row.name.trim(), colour: row.colour as Profile["colour"], icon: row.icon as Profile["icon"] }
}

function parseProfiles(value: unknown): Profile[] {
  if (!Array.isArray(value) || !value.length || value.length > MAX_PROFILES) throw new Error("The saved profile list is invalid.")
  const profiles = value.map(parseProfile)
  if (new Set(profiles.map(profile => profile.id)).size !== profiles.length) throw new Error("The saved profile list contains duplicate profiles.")
  return profiles
}

function assertUniqueProfileName(profiles: Profile[], profile: Profile) {
  const name = profile.name.normalize("NFKC").toLowerCase()
  if (profiles.some(existing => existing.id !== profile.id && existing.name.normalize("NFKC").toLowerCase() === name)) {
    throw new Error("A profile with this name already exists.")
  }
}

function profileId() {
  const bytes = new Uint8Array(16)
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") crypto.getRandomValues(bytes)
  else for (let index = 0; index < bytes.length; index++) bytes[index] = Math.floor(Math.random() * 256)
  return `profile-${Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("")}`
}

function writeSnapshot(store: IDBObjectStore, id: string, data: Data) {
  // Reject unexportable ledgers before either local write is committed.
  serialiseBackup(data)
  store.put(data, currentDataKey)
  store.put(data, profileDataKey(id))
  store.put(data.preferences, preferencesKey)
}

function loadWorkspace(store: IDBObjectStore, ready: (workspace: Workspace) => void, fail: (error: unknown) => void) {
  readValues(store, [profileListKey, activeProfileKey, currentDataKey, preferencesKey], values => {
    try {
      if (!values.has(profileListKey)) {
        const data = snapshot(values.get(currentDataKey))
        if (values.get(currentDataKey) === undefined && values.has(preferencesKey)) {
          data.preferences = parsePreferences(values.get(preferencesKey))
        }
        const profiles = [defaultProfile]
        store.put(profiles, profileListKey)
        store.put(defaultProfile.id, activeProfileKey)
        writeSnapshot(store, defaultProfile.id, data)
        ready({ profiles, activeProfileId: defaultProfile.id, data })
        return
      }

      const profiles = parseProfiles(values.get(profileListKey))
      const requestedId = values.get(activeProfileKey)
      const selected = typeof requestedId === "string" && profiles.some(profile => profile.id === requestedId)
        ? profiles.find(profile => profile.id === requestedId)!
        : profiles[0]
      const activeProfileId = selected.id
      const activeWasValid = activeProfileId === requestedId
      if (!activeWasValid) store.put(activeProfileId, activeProfileKey)

      const finish = (data: Data) => {
        if (values.get(currentDataKey) === undefined || !activeWasValid) writeSnapshot(store, activeProfileId, data)
        else if (!values.has(preferencesKey)) store.put(data.preferences, preferencesKey)
        ready({ profiles, activeProfileId, data })
      }
      const current = values.get(currentDataKey)
      if (activeWasValid && current !== undefined) {
        try { finish(snapshot(current)) } catch (error) {
          if (error instanceof InvalidSnapshot) {
            error.profiles = profiles
            error.activeProfileId = activeProfileId
          }
          throw error
        }
      } else {
        readValue(store, profileDataKey(activeProfileId), raw => {
          try { finish(snapshot(raw)) } catch (error) {
            if (error instanceof InvalidSnapshot) {
              error.profiles = profiles
              error.activeProfileId = activeProfileId
            }
            fail(error)
          }
        }, fail)
      }
    } catch (error) { fail(error) }
  }, fail)
}

export function readWorkspace() {
  return transact<Workspace>("readwrite", (store, complete, fail) => loadWorkspace(store, complete, fail))
}

export function readData() {
  return readWorkspace().then(workspace => workspace.data)
}

export function readPreferences() {
  return transact<Preferences>("readonly", (store, complete, fail) => {
    readValue(store, preferencesKey, raw => complete(raw === undefined ? defaultPreferences : parsePreferences(raw)), fail)
  })
}

export function updateData(change: (current: Data) => Data, expectedProfileId?: string) {
  return transact<Data>("readwrite", (store, complete, fail) => loadWorkspace(store, workspace => {
    if (expectedProfileId && workspace.activeProfileId !== expectedProfileId) {
      fail(new Error("The active profile changed in another tab. Reload before saving this change."))
      return
    }
    try {
      const updated = validateData(change(workspace.data))
      writeSnapshot(store, workspace.activeProfileId, updated)
      complete(updated)
    } catch (error) { fail(error) }
  }, fail))
}

export function createProfile(input: NewProfile) {
  return transact<Workspace>("readwrite", (store, complete, fail) => loadWorkspace(store, workspace => {
    try {
      if (workspace.profiles.length >= MAX_PROFILES) throw new Error(`This browser can store up to ${MAX_PROFILES} profiles.`)
      const profile = parseProfile({ ...input, id: profileId() })
      assertUniqueProfileName(workspace.profiles, profile)
      const profiles = [...workspace.profiles, profile]
      const data = initialData()
      data.preferences = { ...workspace.data.preferences }
      store.put(profiles, profileListKey)
      store.put(profile.id, activeProfileKey)
      writeSnapshot(store, profile.id, data)
      complete({ profiles, activeProfileId: profile.id, data })
    } catch (error) { fail(error) }
  }, fail))
}

export function updateProfile(input: Profile) {
  return transact<Profile[]>("readwrite", (store, complete, fail) => loadWorkspace(store, workspace => {
    try {
      const updated = parseProfile(input)
      if (!workspace.profiles.some(profile => profile.id === updated.id)) throw new Error("That profile no longer exists. Reload and try again.")
      assertUniqueProfileName(workspace.profiles, updated)
      const profiles = workspace.profiles.map(profile => profile.id === updated.id ? updated : profile)
      store.put(profiles, profileListKey)
      complete(profiles)
    } catch (error) { fail(error) }
  }, fail))
}

export function switchProfile(id: string) {
  return transact<Workspace>("readwrite", (store, complete, fail) => readValues(store, [profileListKey, activeProfileKey], values => {
    try {
      if (!values.has(profileListKey)) {
        loadWorkspace(store, workspace => {
          if (workspace.activeProfileId !== id) throw new Error("That profile no longer exists. Reload and try again.")
          complete(workspace)
        }, fail)
        return
      }
      const profiles = parseProfiles(values.get(profileListKey))
      if (!profiles.some(profile => profile.id === id)) throw new Error("That profile no longer exists. Reload and try again.")
      if (values.get(activeProfileKey) === id) {
        loadWorkspace(store, complete, fail)
        return
      }
      readValue(store, profileDataKey(id), raw => {
        try {
          const data = snapshot(raw)
          store.put(id, activeProfileKey)
          writeSnapshot(store, id, data)
          complete({ profiles, activeProfileId: id, data })
        } catch (error) { fail(error) }
      }, fail)
    } catch (error) { fail(error) }
  }, fail))
}

export function recoverData(replacement?: Data, expectedProfileId?: string) {
  return transact<Data>("readwrite", (store, complete, fail) => {
    readValues(store, [profileListKey, activeProfileKey, currentDataKey, preferencesKey], values => {
      try {
        const profiles = values.has(profileListKey) ? parseProfiles(values.get(profileListKey)) : [defaultProfile]
        const requestedId = values.get(activeProfileKey)
        const activeProfileId = typeof requestedId === "string" && profiles.some(profile => profile.id === requestedId)
          ? requestedId
          : profiles[0].id
        if (expectedProfileId && expectedProfileId !== activeProfileId) {
          throw new Error("The active profile changed in another tab. Reload before recovering these records.")
        }
        const raw = values.get(currentDataKey)
        if (raw === undefined) throw new Error("Storage changed while this action was open. Reload your records.")
        try {
          snapshot(raw)
          throw new Error("Storage changed while this action was open. Reload your records.")
        } catch (error) {
          if (!(error instanceof InvalidSnapshot)) throw error
        }
        const updated = replacement ? validateData(replacement) : initialData()
        if (values.has(preferencesKey)) {
          try {
            const preferences = parsePreferences(values.get(preferencesKey))
            updated.preferences = { ...preferences, currency: updated.preferences.currency }
          } catch { /* Keep the defaults when the appearance preference is also damaged. */ }
        }
        if (!values.has(profileListKey)) store.put(profiles, profileListKey)
        store.put(activeProfileId, activeProfileKey)
        writeSnapshot(store, activeProfileId, updated)
        complete(updated)
      } catch (error) { fail(error) }
    }, fail)
  })
}
