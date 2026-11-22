import { defaultPreferences, defaultProfile, initialData, MAX_PROFILES, profileColours, profileIcons, type Data, type NewProfile, type Preferences, type Profile } from "./finance.ts"
import { parsePreferences, serialiseBackup, validateData } from "./backup.ts"
import { initialOnboarding, parseOnboarding, type OnboardingDraft } from "./onboarding.ts"
import {
  PASSWORD_KDF_ITERATIONS, createSalt, decodeCiphertext, decodeSalt, deriveEncryptionKey, encodeBytes,
  openBytes, sealBytes, validateSitePassword, type Ciphertext,
} from "./security.ts"

export const storageName = "money-manager"
const securityKey = "security"
const vaultKey = "local-vault"
const vaultContext = "Money Manager local storage v1"
const maxLocalStorageBytes = 64 * 1024 * 1024
export class InvalidSnapshot extends Error {
  profiles?: Profile[]
  activeProfileId?: string
}
export class EncryptedStorageLocked extends Error {
  constructor() { super("Local storage is locked. Unlock this site before opening its records.") }
}
class EncryptionWasEnabled extends Error {}

const profileListKey = "profiles"
const activeProfileKey = "active-profile"
const currentDataKey = "current"
const preferencesKey = "preferences"
const onboardingKey = "first-time-setup"
const profileDataKey = (id: string) => `profile-data:${id}`
export type Workspace = { profiles: Profile[]; activeProfileId: string; data: Data; onboarding?: OnboardingDraft }

type SecurityConfig = {
  version: 1
  encrypted: boolean
  kdf: "PBKDF2-HMAC-SHA256"
  iterations: number
  salt: string
  verifier: Ciphertext
}
type Vault = { version: 1; revision: number; nonce: string; ciphertext: string }
type StoreImage = Map<string, unknown>

let unlockedKey: Uint8Array | undefined

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
    const guard = store.get(securityKey)
    guard.onsuccess = () => {
      try {
        const config = parseSecurityConfig(guard.result)
        if (config?.encrypted) throw new EncryptionWasEnabled()
        operation(store, complete, fail)
      } catch (error) { fail(error) }
    }
    guard.onerror = () => fail(guard.error ?? new Error("The local security settings could not be read."))
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

function parseSecurityConfig(value: unknown): SecurityConfig | undefined {
  if (value === undefined) return undefined
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("The local security settings are damaged.")
  const row = value as Record<string, unknown>
  const fields = ["version", "encrypted", "kdf", "iterations", "salt", "verifier"]
  if (Object.keys(row).length !== fields.length || !fields.every(field => field in row) || row.version !== 1 ||
      typeof row.encrypted !== "boolean" || row.kdf !== "PBKDF2-HMAC-SHA256" || row.iterations !== PASSWORD_KDF_ITERATIONS) {
    throw new Error("The local security settings use an unsupported format.")
  }
  decodeSalt(row.salt)
  return {
    version: 1, encrypted: row.encrypted, kdf: "PBKDF2-HMAC-SHA256", iterations: PASSWORD_KDF_ITERATIONS,
    salt: row.salt as string, verifier: decodeCiphertext(row.verifier),
  }
}

function parseVault(value: unknown): Vault {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Encrypted local storage could not be read.")
  const row = value as Record<string, unknown>
  const fields = ["version", "revision", "nonce", "ciphertext"]
  if (Object.keys(row).length !== fields.length || !fields.every(field => field in row) || row.version !== 1 ||
      typeof row.revision !== "number" || !Number.isSafeInteger(row.revision) || row.revision < 1) {
    throw new Error("Encrypted local storage uses an unsupported format.")
  }
  const encrypted = decodeCiphertext({ nonce: row.nonce, ciphertext: row.ciphertext }, maxLocalStorageBytes)
  return { version: 1, revision: row.revision, ...encrypted }
}

function imageFromRows(keys: IDBValidKey[], values: unknown[]) {
  const image: StoreImage = new Map()
  if (keys.length !== values.length || keys.length > 10_000) throw new Error("The local storage snapshot is invalid.")
  keys.forEach((key, index) => {
    if (typeof key !== "string" || image.has(key)) throw new Error("The local storage snapshot is invalid.")
    image.set(key, values[index])
  })
  return image
}

function imageSignature(image: StoreImage) {
  return JSON.stringify([...image.entries()].sort(([left], [right]) => left.localeCompare(right)))
}

function readStoreImage() {
  return openDatabase().then(db => new Promise<StoreImage>((resolve, reject) => {
    const transaction = db.transaction("snapshots", "readonly")
    const store = transaction.objectStore("snapshots")
    const keys = store.getAllKeys()
    const values = store.getAll()
    let image: StoreImage | undefined
    let failure: unknown
    transaction.oncomplete = () => image ? resolve(image) : reject(failure ?? new Error("The local storage snapshot could not be read."))
    transaction.onabort = () => reject(failure ?? transaction.error ?? new Error("The local storage snapshot could not be read."))
    keys.onerror = () => { failure = keys.error; try { transaction.abort() } catch { reject(failure) } }
    values.onerror = () => { failure = values.error; try { transaction.abort() } catch { reject(failure) } }
    let keysResult: IDBValidKey[] | undefined
    let valuesResult: unknown[] | undefined
    const finish = () => {
      if (!keysResult || !valuesResult) return
      try { image = imageFromRows(keysResult, valuesResult) } catch (error) { failure = error; try { transaction.abort() } catch { reject(error) } }
    }
    keys.onsuccess = () => { keysResult = keys.result; finish() }
    values.onsuccess = () => { valuesResult = values.result; finish() }
  }).finally(() => db.close()))
}

function replaceStoreImage(expected: StoreImage, replacement: StoreImage) {
  return openDatabase().then(db => new Promise<boolean>((resolve, reject) => {
    const transaction = db.transaction("snapshots", "readwrite")
    const store = transaction.objectStore("snapshots")
    const keys = store.getAllKeys()
    const values = store.getAll()
    let failure: unknown
    let matched = false
    transaction.oncomplete = () => resolve(matched)
    transaction.onabort = () => reject(failure ?? transaction.error ?? new Error("The local storage update was interrupted."))
    keys.onerror = () => { failure = keys.error; try { transaction.abort() } catch { reject(failure) } }
    values.onerror = () => { failure = values.error; try { transaction.abort() } catch { reject(failure) } }
    let keysResult: IDBValidKey[] | undefined
    let valuesResult: unknown[] | undefined
    const finish = () => {
      if (!keysResult || !valuesResult) return
      try {
        const actual = imageFromRows(keysResult, valuesResult)
        if (imageSignature(actual) !== imageSignature(expected)) return
        matched = true
        store.clear()
        for (const [key, value] of replacement) store.put(value, key)
      } catch (error) { failure = error; try { transaction.abort() } catch { reject(error) } }
    }
    keys.onsuccess = () => { keysResult = keys.result; finish() }
    values.onsuccess = () => { valuesResult = values.result; finish() }
  }).finally(() => db.close()))
}

const textEncoder = new TextEncoder()

function serialiseImage(image: StoreImage) {
  const bytes = textEncoder.encode(JSON.stringify([...image.entries()]))
  if (bytes.length > maxLocalStorageBytes) {
    bytes.fill(0)
    throw new Error("This browser's stored data is too large to encrypt in one step. Download a backup for each profile before continuing.")
  }
  return bytes
}

function parseImage(bytes: Uint8Array): StoreImage {
  let rows: unknown
  try { rows = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)) } catch {
    throw new Error("Encrypted local storage contains invalid data. The original encrypted copy has been kept.")
  }
  if (!Array.isArray(rows) || rows.length > 10_000) throw new Error("Encrypted local storage contains an invalid snapshot.")
  const image: StoreImage = new Map()
  for (const pair of rows) {
    if (!Array.isArray(pair) || pair.length !== 2 || typeof pair[0] !== "string" || pair[0] === securityKey || pair[0] === vaultKey || image.has(pair[0])) {
      throw new Error("Encrypted local storage contains an invalid snapshot.")
    }
    image.set(pair[0], pair[1])
  }
  return image
}

function encryptImage(image: StoreImage, key: Uint8Array, revision: number) {
  const bytes = serialiseImage(image)
  try {
    const sealed = sealBytes(key, vaultContext, bytes)
    return { version: 1 as const, revision, ...sealed }
  } finally { bytes.fill(0) }
}

function decryptImage(vault: Vault, key: Uint8Array) {
  const bytes = openBytes(key, vaultContext, vault, maxLocalStorageBytes)
  try { return parseImage(bytes) } finally { bytes.fill(0) }
}

async function readSecurityConfig() {
  return openDatabase().then(db => new Promise<SecurityConfig | undefined>((resolve, reject) => {
    const transaction = db.transaction("snapshots", "readonly")
    const request = transaction.objectStore("snapshots").get(securityKey)
    let config: SecurityConfig | undefined
    let failure: unknown
    request.onsuccess = () => {
      try { config = parseSecurityConfig(request.result) } catch (error) { failure = error; try { transaction.abort() } catch { reject(error) } }
    }
    request.onerror = () => { failure = request.error; try { transaction.abort() } catch { reject(failure) } }
    transaction.oncomplete = () => resolve(config)
    transaction.onabort = () => reject(failure ?? transaction.error ?? new Error("The local security settings could not be read."))
  }).finally(() => db.close()))
}

function encryptedSnapshot() {
  return openDatabase().then(db => new Promise<{ config: SecurityConfig; vault: Vault }>((resolve, reject) => {
    const transaction = db.transaction("snapshots", "readonly")
    const store = transaction.objectStore("snapshots")
    const configRequest = store.get(securityKey)
    const vaultRequest = store.get(vaultKey)
    let config: SecurityConfig | undefined
    let vault: Vault | undefined
    let failure: unknown
    transaction.oncomplete = () => config && vault ? resolve({ config, vault }) : reject(failure ?? new Error("Encrypted local storage could not be read."))
    transaction.onabort = () => reject(failure ?? transaction.error ?? new Error("Encrypted local storage could not be read."))
    configRequest.onsuccess = () => {
      try { config = parseSecurityConfig(configRequest.result) } catch (error) { failure = error; try { transaction.abort() } catch { reject(error) } }
    }
    vaultRequest.onsuccess = () => {
      try { if (vaultRequest.result !== undefined) vault = parseVault(vaultRequest.result) } catch (error) { failure = error; try { transaction.abort() } catch { reject(error) } }
    }
    configRequest.onerror = () => { failure = configRequest.error; try { transaction.abort() } catch { reject(failure) } }
    vaultRequest.onerror = () => { failure = vaultRequest.error; try { transaction.abort() } catch { reject(failure) } }
  }).finally(() => db.close()))
}

function makeVerifier(key: Uint8Array) {
  const plaintext = textEncoder.encode("password verified")
  try { return sealBytes(key, "Money Manager password verifier v1", plaintext) }
  finally { plaintext.fill(0) }
}

function sameSecurityConfig(left?: SecurityConfig, right?: SecurityConfig) {
  return Boolean(left && right && left.version === right.version && left.encrypted === right.encrypted &&
    left.kdf === right.kdf && left.iterations === right.iterations && left.salt === right.salt &&
    left.verifier.nonce === right.verifier.nonce && left.verifier.ciphertext === right.verifier.ciphertext)
}

async function verifyPassword(password: string, config: SecurityConfig) {
  let key: Uint8Array | undefined
  try {
    key = await deriveEncryptionKey(password, decodeSalt(config.salt))
    const plaintext = openBytes(key, "Money Manager password verifier v1", config.verifier, 32)
    let valid: boolean
    try { valid = new TextDecoder().decode(plaintext) === "password verified" }
    finally { plaintext.fill(0) }
    if (!valid) throw new Error("invalid")
    return key
  } catch {
    key?.fill(0)
    throw new Error("That password did not unlock Money Manager.")
  }
}

function cloneImage(image: StoreImage) { return new Map(image) }

function storeWithSecurity(image: StoreImage, config: SecurityConfig) {
  const next = cloneImage(image)
  next.set(securityKey, config)
  return next
}

function rememberUnlockedKey(key: Uint8Array) {
  if (unlockedKey !== key) unlockedKey?.fill(0)
  unlockedKey = key
}

async function readEncryptedImage() {
  const key = unlockedKey
  if (!key) throw new EncryptedStorageLocked()
  const snapshot = await encryptedSnapshot()
  if (!snapshot.config.encrypted) throw new Error("Local storage encryption changed in another tab. Reload this page.")
  const activeKey = key.slice()
  try {
    const image = decryptImage(snapshot.vault, activeKey)
    if (unlockedKey !== key) throw new EncryptedStorageLocked()
    return { image, vault: snapshot.vault, key }
  } finally { activeKey.fill(0) }
}

async function commitEncryptedImage(image: StoreImage, expectedVault: Vault, key: Uint8Array) {
  const nextVault = encryptImage(image, key, expectedVault.revision + 1)
  return openDatabase().then(db => new Promise<boolean>((resolve, reject) => {
    const transaction = db.transaction("snapshots", "readwrite")
    const store = transaction.objectStore("snapshots")
    const configRequest = store.get(securityKey)
    const vaultRequest = store.get(vaultKey)
    let matched = false
    let failure: unknown
    let configReady = false
    let vaultReady = false
    let currentConfig: SecurityConfig | undefined
    let currentVault: Vault | undefined
    transaction.oncomplete = () => resolve(matched)
    transaction.onabort = () => reject(failure ?? transaction.error ?? new Error("The encrypted local save was interrupted."))
    const finish = () => {
      if (!configReady || !vaultReady) return
      try {
        if (!currentConfig?.encrypted || !currentVault || currentVault.revision !== expectedVault.revision ||
            currentVault.nonce !== expectedVault.nonce || currentVault.ciphertext !== expectedVault.ciphertext) return
        matched = true
        store.put(nextVault, vaultKey)
      } catch (error) { failure = error; try { transaction.abort() } catch { reject(error) } }
    }
    configRequest.onsuccess = () => {
      try { currentConfig = parseSecurityConfig(configRequest.result); configReady = true; finish() }
      catch (error) { failure = error; try { transaction.abort() } catch { reject(error) } }
    }
    vaultRequest.onsuccess = () => {
      try { if (vaultRequest.result !== undefined) currentVault = parseVault(vaultRequest.result); vaultReady = true; finish() }
      catch (error) { failure = error; try { transaction.abort() } catch { reject(error) } }
    }
    configRequest.onerror = () => { failure = configRequest.error; try { transaction.abort() } catch { reject(failure) } }
    vaultRequest.onerror = () => { failure = vaultRequest.error; try { transaction.abort() } catch { reject(failure) } }
  }).finally(() => db.close()))
}

async function mutateEncrypted<T>(change: (image: StoreImage) => T) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const snapshot = await readEncryptedImage()
    const keyCopy = snapshot.key.slice()
    try {
      const result = change(snapshot.image)
      if (unlockedKey !== snapshot.key) throw new EncryptedStorageLocked()
      if (await commitEncryptedImage(snapshot.image, snapshot.vault, keyCopy)) return result
    } finally { keyCopy.fill(0) }
  }
  throw new Error("Local data changed in another tab. Reload and try again.")
}

function loadWorkspaceFromImage(image: StoreImage): Workspace {
  const profiles = parseProfiles(image.get(profileListKey))
  const requestedId = image.get(activeProfileKey)
  const selected = typeof requestedId === "string" && profiles.some(profile => profile.id === requestedId)
    ? profiles.find(profile => profile.id === requestedId)!
    : profiles[0]
  const activeProfileId = selected.id
  const raw = activeProfileId === requestedId && image.has(currentDataKey) ? image.get(currentDataKey) : image.get(profileDataKey(activeProfileId))
  try { return { profiles, activeProfileId, data: snapshot(raw) } }
  catch (error) {
    if (error instanceof InvalidSnapshot) {
      error.profiles = profiles
      error.activeProfileId = activeProfileId
    }
    throw error
  }
}

function writeSnapshotToImage(image: StoreImage, id: string, data: Data) {
  serialiseBackup(data)
  image.set(currentDataKey, data)
  image.set(profileDataKey(id), data)
  image.set(preferencesKey, data.preferences)
}

function updateEncryptedWorkspace<T>(change: (image: StoreImage, workspace: Workspace) => T) {
  return mutateEncrypted(image => change(image, loadWorkspaceFromImage(image)))
}

async function migrationReplacement(expected: StoreImage, config: SecurityConfig, key: Uint8Array, encrypted: boolean) {
  const clean = new Map([...expected].filter(([name]) => name !== securityKey && name !== vaultKey))
  const nextConfig: SecurityConfig = { ...config, encrypted }
  const replacement = encrypted
    ? new Map<string, unknown>([[securityKey, nextConfig], [vaultKey, encryptImage(clean, key, 1)]])
    : storeWithSecurity(clean, nextConfig)
  const committed = await replaceStoreImage(expected, replacement)
  if (!committed) throw new Error("Local data changed in another tab. Reload and try again before changing encryption.")
}

async function withStorageMode<T>(plain: () => Promise<T>, encrypted: () => Promise<T>) {
  const config = await readSecurityConfig()
  if (config?.encrypted) return encrypted()
  try { return await plain() } catch (error) {
    if (error instanceof EncryptionWasEnabled) return encrypted()
    throw error
  }
}

function securityConfig(salt: Uint8Array, verifier: Ciphertext, encrypted: boolean): SecurityConfig {
  return {
    version: 1, encrypted, kdf: "PBKDF2-HMAC-SHA256", iterations: PASSWORD_KDF_ITERATIONS,
    salt: encodeBytes(salt), verifier,
  }
}

export async function readSecurityStatus() {
  const config = await readSecurityConfig()
  return { configured: Boolean(config), storageEncrypted: Boolean(config?.encrypted) }
}

export async function setupSitePassword(password: string, encryptStorage: boolean) {
  validateSitePassword(password)
  if (await readSecurityConfig()) throw new Error("A site password is already set.")
  const expected = await readStoreImage()
  if (expected.has(securityKey) || expected.has(vaultKey)) throw new Error("Local security settings already exist. Reload this page and try again.")
  const salt = createSalt()
  const key = await deriveEncryptionKey(password, salt)
  let retained = false
  try {
    const config = securityConfig(salt, makeVerifier(key), encryptStorage)
    if (encryptStorage) {
      await migrationReplacement(expected, config, key, true)
      rememberUnlockedKey(key)
      retained = true
    } else {
      const replacement = storeWithSecurity(expected, config)
      if (!await replaceStoreImage(expected, replacement)) throw new Error("Local data changed in another tab. Reload and try again before setting a password.")
    }
  } finally { if (!retained) key.fill(0) }
}

export async function unlockSitePassword(password: string) {
  lockSite()
  const config = await readSecurityConfig()
  if (!config) throw new Error("A site password has not been set.")
  const key = await verifyPassword(password, config)
  try {
    if (!sameSecurityConfig(await readSecurityConfig(), config)) throw new Error("Local security settings changed in another tab. Reload this page.")
    if (!config.encrypted) { key.fill(0); return }
    const { config: currentConfig, vault } = await encryptedSnapshot()
    if (!currentConfig.encrypted || !sameSecurityConfig(currentConfig, config)) throw new Error("Local security settings changed in another tab. Reload this page.")
    decryptImage(vault, key)
    rememberUnlockedKey(key)
  } catch (error) {
    key.fill(0)
    if (error instanceof Error && /password did not open/i.test(error.message)) throw new Error("Encrypted local storage could not be opened. The encrypted copy has been kept.")
    throw error
  }
}

export function lockSite() {
  unlockedKey?.fill(0)
  unlockedKey = undefined
}

export async function setLocalStorageEncryption(password: string, encrypt: boolean) {
  const config = await readSecurityConfig()
  if (!config) throw new Error("Set a site password before changing local storage encryption.")
  const key = await verifyPassword(password, config)
  let retain = false
  try {
    if (!sameSecurityConfig(await readSecurityConfig(), config)) throw new Error("Local security settings changed in another tab. Reload and try again.")
    if (config.encrypted === encrypt) {
      if (encrypt) {
        const { config: currentConfig, vault } = await encryptedSnapshot()
        if (!sameSecurityConfig(currentConfig, config)) throw new Error("Local security settings changed in another tab. Reload and try again.")
        decryptImage(vault, key)
        rememberUnlockedKey(key)
        retain = true
      }
      return
    }
    if (encrypt) {
      const expected = await readStoreImage()
      const actualConfig = parseSecurityConfig(expected.get(securityKey))
      if (!actualConfig || !sameSecurityConfig(actualConfig, config) || actualConfig.encrypted || expected.has(vaultKey)) throw new Error("Local security settings changed in another tab. Reload and try again.")
      await migrationReplacement(expected, config, key, true)
      rememberUnlockedKey(key)
      retain = true
      return
    }
    const { vault } = await encryptedSnapshot()
    const decrypted = decryptImage(vault, key)
    const expected = await readStoreImage()
    const currentConfig = parseSecurityConfig(expected.get(securityKey))
    const currentVault = parseVault(expected.get(vaultKey))
    if (!currentConfig || !sameSecurityConfig(currentConfig, config) || !currentConfig.encrypted || currentVault.revision !== vault.revision || currentVault.nonce !== vault.nonce || currentVault.ciphertext !== vault.ciphertext) {
      throw new Error("Encrypted local data changed in another tab. Reload and try again.")
    }
    const replacement = storeWithSecurity(decrypted, { ...currentConfig, encrypted: false })
    if (!await replaceStoreImage(expected, replacement)) throw new Error("Encrypted local data changed in another tab. Reload and try again.")
  } finally {
    if (!retain) {
      key.fill(0)
      lockSite()
    }
  }
}

export async function removeSitePassword(password: string) {
  const config = await readSecurityConfig()
  if (!config) return
  const key = await verifyPassword(password, config)
  try {
    const expected = await readStoreImage()
    const actualConfig = parseSecurityConfig(expected.get(securityKey))
    if (!actualConfig || !sameSecurityConfig(actualConfig, config)) throw new Error("Local security settings changed in another tab. Reload and try again.")
    let replacement: StoreImage
    if (actualConfig.encrypted) {
      const vault = parseVault(expected.get(vaultKey))
      const image = decryptImage(vault, key)
      replacement = image
    } else {
      replacement = cloneImage(expected)
      replacement.delete(securityKey)
      replacement.delete(vaultKey)
    }
    if (!await replaceStoreImage(expected, replacement)) throw new Error("Local data changed in another tab. Reload and try again before removing the password.")
  } finally { key.fill(0); lockSite() }
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
  readValues(store, [profileListKey, activeProfileKey, currentDataKey, preferencesKey, onboardingKey, securityKey, profileDataKey(defaultProfile.id)], values => {
    try {
      if (!values.has(profileListKey)) {
        const data = snapshot(values.get(currentDataKey) ?? values.get(profileDataKey(defaultProfile.id)))
        if (values.get(currentDataKey) === undefined && values.has(preferencesKey)) {
          data.preferences = parsePreferences(values.get(preferencesKey))
        }
        const onboarding = values.size === 0 ? initialOnboarding() : undefined
        if (onboarding) store.put(onboarding, onboardingKey)
        const profiles = [defaultProfile]
        store.put(profiles, profileListKey)
        store.put(defaultProfile.id, activeProfileKey)
        writeSnapshot(store, defaultProfile.id, data)
        ready({ profiles, activeProfileId: defaultProfile.id, data, ...(onboarding ? { onboarding } : {}) })
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
        const stored = values.get(onboardingKey)
        const eligible = !values.has(securityKey) && profiles.length === 1 && activeProfileId === defaultProfile.id &&
          !data.entries.length && !data.budgets.length && !data.goals.length && !data.contributions.length && !data.accounts?.length
        let onboarding: OnboardingDraft | undefined
        if (stored && stored !== "complete" && eligible) {
          try { onboarding = parseOnboarding(stored) }
          catch { onboarding = initialOnboarding(); store.put(onboarding, onboardingKey) }
        } else if (stored && stored !== "complete") store.put("complete", onboardingKey)
        ready({ profiles, activeProfileId, data, ...(onboarding ? { onboarding } : {}) })
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
  return withStorageMode(
    () => transact<Workspace>("readwrite", (store, complete, fail) => loadWorkspace(store, complete, fail)),
    async () => loadWorkspaceFromImage((await readEncryptedImage()).image),
  )
}

export function readData() {
  return readWorkspace().then(workspace => workspace.data)
}

export function saveOnboarding(draft: OnboardingDraft) {
  return transact<boolean>("readwrite", (store, complete, fail) => {
    readValue(store, onboardingKey, saved => {
      try {
        if (!saved || saved === "complete") { complete(false); return }
        store.put(parseOnboarding(draft), onboardingKey)
        complete(true)
      } catch (error) { fail(error) }
    }, fail)
  })
}

export function finishOnboarding(draft: OnboardingDraft, skip: boolean) {
  return transact<{ workspace: Workspace; applied: boolean }>("readwrite", (store, complete, fail) => loadWorkspace(store, workspace => {
    if (!workspace.onboarding) { complete({ workspace, applied: false }); return }
    try {
      const setup = skip ? initialOnboarding() : parseOnboarding(draft)
      if (setup.editor) throw new Error("Add or cancel the account before finishing setup.")
      const data = validateData({ ...workspace.data, accounts: setup.accounts, preferences: setup.preferences })
      writeSnapshot(store, workspace.activeProfileId, data)
      store.put("complete", onboardingKey)
      complete({ workspace: { profiles: workspace.profiles, activeProfileId: workspace.activeProfileId, data }, applied: true })
    } catch (error) { fail(error) }
  }, fail))
}

export function readPreferences() {
  return withStorageMode(
    () => transact<Preferences>("readonly", (store, complete, fail) => {
      readValue(store, preferencesKey, raw => complete(raw === undefined ? defaultPreferences : parsePreferences(raw)), fail)
    }),
    async () => loadWorkspaceFromImage((await readEncryptedImage()).image).data.preferences,
  )
}

export function updateData(change: (current: Data) => Data, expectedProfileId?: string) {
  return withStorageMode(
    () => transact<Data>("readwrite", (store, complete, fail) => loadWorkspace(store, workspace => {
      if (expectedProfileId && workspace.activeProfileId !== expectedProfileId) {
        fail(new Error("The active profile changed in another tab. Reload before saving this change."))
        return
      }
      try {
        const updated = validateData(change(workspace.data))
        writeSnapshot(store, workspace.activeProfileId, updated)
        if (workspace.onboarding) store.put("complete", onboardingKey)
        complete(updated)
      } catch (error) { fail(error) }
    }, fail)),
    () => updateEncryptedWorkspace((image, workspace) => {
      if (expectedProfileId && workspace.activeProfileId !== expectedProfileId) throw new Error("The active profile changed in another tab. Reload before saving this change.")
      const updated = validateData(change(workspace.data))
      writeSnapshotToImage(image, workspace.activeProfileId, updated)
      return updated
    }),
  )
}

export function createProfile(input: NewProfile) {
  return withStorageMode(
    () => transact<Workspace>("readwrite", (store, complete, fail) => loadWorkspace(store, workspace => {
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
    }, fail)),
    () => updateEncryptedWorkspace((image, workspace) => {
      if (workspace.profiles.length >= MAX_PROFILES) throw new Error(`This browser can store up to ${MAX_PROFILES} profiles.`)
      const profile = parseProfile({ ...input, id: profileId() })
      assertUniqueProfileName(workspace.profiles, profile)
      const profiles = [...workspace.profiles, profile]
      const data = initialData()
      data.preferences = { ...workspace.data.preferences }
      image.set(profileListKey, profiles)
      image.set(activeProfileKey, profile.id)
      writeSnapshotToImage(image, profile.id, data)
      return { profiles, activeProfileId: profile.id, data }
    }),
  )
}

export function updateProfile(input: Profile) {
  return withStorageMode(
    () => transact<Profile[]>("readwrite", (store, complete, fail) => loadWorkspace(store, workspace => {
      try {
        const updated = parseProfile(input)
        if (!workspace.profiles.some(profile => profile.id === updated.id)) throw new Error("That profile no longer exists. Reload and try again.")
        assertUniqueProfileName(workspace.profiles, updated)
        const profiles = workspace.profiles.map(profile => profile.id === updated.id ? updated : profile)
        store.put(profiles, profileListKey)
        complete(profiles)
      } catch (error) { fail(error) }
    }, fail)),
    () => updateEncryptedWorkspace((image, workspace) => {
      const updated = parseProfile(input)
      if (!workspace.profiles.some(profile => profile.id === updated.id)) throw new Error("That profile no longer exists. Reload and try again.")
      assertUniqueProfileName(workspace.profiles, updated)
      const profiles = workspace.profiles.map(profile => profile.id === updated.id ? updated : profile)
      image.set(profileListKey, profiles)
      return profiles
    }),
  )
}

export function switchProfile(id: string) {
  return withStorageMode(
    () => transact<Workspace>("readwrite", (store, complete, fail) => readValues(store, [profileListKey, activeProfileKey], values => {
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
    }, fail)),
    () => mutateEncrypted(image => {
      const profiles = parseProfiles(image.get(profileListKey))
      if (!profiles.some(profile => profile.id === id)) throw new Error("That profile no longer exists. Reload and try again.")
      if (image.get(activeProfileKey) === id) return loadWorkspaceFromImage(image)
      const data = snapshot(image.get(profileDataKey(id)))
      image.set(activeProfileKey, id)
      writeSnapshotToImage(image, id, data)
      return { profiles, activeProfileId: id, data }
    }),
  )
}

export function recoverData(replacement?: Data, expectedProfileId?: string) {
  return withStorageMode(
    () => transact<Data>("readwrite", (store, complete, fail) => {
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
              updated.preferences = { ...preferences, currency: updated.preferences.currency, currencyDigits: updated.preferences.currencyDigits }
            } catch { /* Keep the defaults when the appearance preference is also damaged. */ }
          }
          if (!values.has(profileListKey)) store.put(profiles, profileListKey)
          store.put(activeProfileId, activeProfileKey)
          writeSnapshot(store, activeProfileId, updated)
          complete(updated)
        } catch (error) { fail(error) }
      }, fail)
    }),
    () => mutateEncrypted(image => {
      const profiles = image.has(profileListKey) ? parseProfiles(image.get(profileListKey)) : [defaultProfile]
      const requestedId = image.get(activeProfileKey)
      const activeProfileId = typeof requestedId === "string" && profiles.some(profile => profile.id === requestedId)
        ? requestedId
        : profiles[0].id
      if (expectedProfileId && expectedProfileId !== activeProfileId) {
        throw new Error("The active profile changed in another tab. Reload before recovering these records.")
      }
      const raw = image.get(currentDataKey)
      if (raw === undefined) throw new Error("Storage changed while this action was open. Reload your records.")
      try {
        snapshot(raw)
        throw new Error("Storage changed while this action was open. Reload your records.")
      } catch (error) {
        if (!(error instanceof InvalidSnapshot)) throw error
      }
      const updated = replacement ? validateData(replacement) : initialData()
      if (image.has(preferencesKey)) {
        try {
          const preferences = parsePreferences(image.get(preferencesKey))
          updated.preferences = { ...preferences, currency: updated.preferences.currency, currencyDigits: updated.preferences.currencyDigits }
        } catch { /* Keep the defaults when the appearance preference is also damaged. */ }
      }
      image.set(profileListKey, profiles)
      image.set(activeProfileKey, activeProfileId)
      writeSnapshotToImage(image, activeProfileId, updated)
      return updated
    }),
  )
}
