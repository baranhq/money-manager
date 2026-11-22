import { xchacha20poly1305 } from "@noble/ciphers/chacha.js"
import { randomBytes } from "@noble/ciphers/utils.js"
import { pbkdf2Async } from "@noble/hashes/pbkdf2.js"
import { sha256 } from "@noble/hashes/sha2.js"
import { MAX_BYTES } from "./backup.ts"

export const PASSWORD_KDF_ITERATIONS = 600_000
export const MAX_PROTECTED_EXPORT_BYTES = 12 * 1024 * 1024
const MAX_PASSWORD_BYTES = 512
const SALT_BYTES = 16
const NONCE_BYTES = 24
const KEY_BYTES = 32
const verifierLabel = "Money Manager password verifier v1\0"
const exportLabel = "Money Manager protected export v1\0"
const encoder = new TextEncoder()

export type ProtectedExportKind = "backup" | "csv"
export type Ciphertext = { nonce: string; ciphertext: string }

type ProtectedExport = {
  format: "money-manager-encrypted-export"
  version: 1
  kind: ProtectedExportKind
  kdf: "PBKDF2-HMAC-SHA256"
  iterations: number
  salt: string
  nonce: string
  ciphertext: string
}
function bytesToBase64Url(bytes: Uint8Array) {
  let binary = ""
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000))
  }
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/u, "")
}

function base64UrlToBytes(value: unknown, minimumLength: number, maximumLength: number) {
  if (typeof value !== "string" || value.length > Math.ceil(maximumLength * 4 / 3) + 4 || !/^[A-Za-z0-9_-]+$/u.test(value)) {
    throw new Error("The protected file is invalid.")
  }
  const base64 = value.replaceAll("-", "+").replaceAll("_", "/")
  let binary: string
  try { binary = atob(base64 + "=".repeat((4 - base64.length % 4) % 4)) } catch {
    throw new Error("The protected file is invalid.")
  }
  if (binary.length < minimumLength || binary.length > maximumLength) throw new Error("The protected file is invalid.")
  const bytes = Uint8Array.from(binary, character => character.charCodeAt(0))
  if (bytesToBase64Url(bytes) !== value) throw new Error("The protected file is invalid.")
  return bytes
}

export function validateSitePassword(password: string) {
  const byteLength = encoder.encode(password).length
  if (password.length < 12) throw new Error("Use a password with at least 12 characters.")
  if (password.length > 128 || byteLength > MAX_PASSWORD_BYTES) throw new Error("Use a password no longer than 128 characters.")
  return password
}

export function createSalt() {
  return randomBytes(SALT_BYTES)
}

export async function deriveEncryptionKey(password: string, salt: Uint8Array) {
  validateSitePassword(password)
  if (salt.length !== SALT_BYTES) throw new Error("The password settings are invalid.")
  const passwordBytes = encoder.encode(password)
  try {
    if (globalThis.crypto?.subtle && globalThis.isSecureContext !== false) {
      try {
        const material = await globalThis.crypto.subtle.importKey("raw", passwordBytes, "PBKDF2", false, ["deriveBits"])
        const saltBytes = Uint8Array.from(salt)
        const bits = await globalThis.crypto.subtle.deriveBits({
          name: "PBKDF2", hash: "SHA-256", salt: saltBytes, iterations: PASSWORD_KDF_ITERATIONS,
        }, material, KEY_BYTES * 8)
        return new Uint8Array(bits)
      } catch {
        // Plain HTTP origins and restricted browsers use the bundled implementation below.
      }
    }
    return await pbkdf2Async(sha256, passwordBytes, salt, { c: PASSWORD_KDF_ITERATIONS, dkLen: KEY_BYTES })
  } finally { passwordBytes.fill(0) }
}

export function sealBytes(key: Uint8Array, context: string, plaintext: Uint8Array): Ciphertext {
  if (key.length !== KEY_BYTES || !context || context.length > 80) throw new Error("The encryption settings are invalid.")
  const nonce = randomBytes(NONCE_BYTES)
  const prefix = encoder.encode(`${context}\0`)
  const message = new Uint8Array(prefix.length + plaintext.length)
  message.set(prefix)
  message.set(plaintext, prefix.length)
  const ciphertext = xchacha20poly1305(key, nonce).encrypt(message)
  message.fill(0)
  return { nonce: bytesToBase64Url(nonce), ciphertext: bytesToBase64Url(ciphertext) }
}

export function openBytes(key: Uint8Array, context: string, encrypted: Ciphertext, maximumPlaintextBytes = MAX_PROTECTED_EXPORT_BYTES) {
  if (key.length !== KEY_BYTES || !context || context.length > 80) throw new Error("The encryption settings are invalid.")
  const nonce = base64UrlToBytes(encrypted.nonce, NONCE_BYTES, NONCE_BYTES)
  const ciphertext = base64UrlToBytes(encrypted.ciphertext, 16, maximumPlaintextBytes + 128)
  let message: Uint8Array
  try { message = xchacha20poly1305(key, nonce).decrypt(ciphertext) } catch {
    throw new Error("The password did not open this protected data. It may be incorrect or the file may have changed.")
  }
  const prefix = encoder.encode(`${context}\0`)
  const prefixMatches = message.length >= prefix.length && prefix.every((byte, index) => message[index] === byte)
  if (!prefixMatches || message.length - prefix.length > maximumPlaintextBytes) {
    message.fill(0)
    throw new Error("The protected data is invalid.")
  }
  const plaintext = message.slice(prefix.length)
  message.fill(0)
  return plaintext
}

export function encodeBytes(bytes: Uint8Array) {
  return bytesToBase64Url(bytes)
}

export function decodeSalt(value: unknown) {
  return base64UrlToBytes(value, SALT_BYTES, SALT_BYTES)
}

export function decodeCiphertext(value: unknown, maximumBytes = MAX_PROTECTED_EXPORT_BYTES): Ciphertext {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("The password settings are invalid.")
  const row = value as Record<string, unknown>
  if (Object.keys(row).length !== 2 || typeof row.nonce !== "string" || typeof row.ciphertext !== "string") {
    throw new Error("The password settings are invalid.")
  }
  base64UrlToBytes(row.nonce, NONCE_BYTES, NONCE_BYTES)
  base64UrlToBytes(row.ciphertext, 16, maximumBytes + 128)
  return { nonce: row.nonce, ciphertext: row.ciphertext }
}

function readExport(text: string): ProtectedExport | undefined {
  if (encoder.encode(text).length > MAX_PROTECTED_EXPORT_BYTES) throw new Error("Choose a protected file no larger than 12 MB.")
  let value: unknown
  try { value = JSON.parse(text) } catch { return undefined }
  if (!value || typeof value !== "object" || Array.isArray(value) || (value as Record<string, unknown>).format !== "money-manager-encrypted-export") return undefined
  if (JSON.stringify(value) !== text) throw new Error("This protected file is not in a valid format.")
  const row = value as Record<string, unknown>
  const fields = ["format", "version", "kind", "kdf", "iterations", "salt", "nonce", "ciphertext"]
  if (Object.keys(row).length !== fields.length || !fields.every(field => field in row) || row.version !== 1 ||
      row.kdf !== "PBKDF2-HMAC-SHA256" || row.iterations !== PASSWORD_KDF_ITERATIONS ||
      (row.kind !== "backup" && row.kind !== "csv")) {
    throw new Error("This protected file uses unsupported security settings.")
  }
  decodeSalt(row.salt)
  decodeCiphertext({ nonce: row.nonce, ciphertext: row.ciphertext })
  return row as ProtectedExport
}

export function protectedExportKind(text: string): ProtectedExportKind | undefined {
  return readExport(text)?.kind
}

export async function encryptProtectedExport(text: string, password: string, kind: ProtectedExportKind) {
  validateSitePassword(password)
  const plaintext = encoder.encode(text)
  if (plaintext.length > MAX_BYTES) throw new Error("This file is too large to protect. Keep the unprotected file below 8 MB.")
  const salt = createSalt()
  const key = await deriveEncryptionKey(password, salt)
  try {
    const encrypted = sealBytes(key, `${exportLabel}${kind}`, plaintext)
    const envelope: ProtectedExport = {
      format: "money-manager-encrypted-export", version: 1, kind,
      kdf: "PBKDF2-HMAC-SHA256", iterations: PASSWORD_KDF_ITERATIONS,
      salt: bytesToBase64Url(salt), ...encrypted,
    }
    const output = JSON.stringify(envelope)
    if (encoder.encode(output).length > MAX_PROTECTED_EXPORT_BYTES) throw new Error("This protected file is too large to download.")
    return output
  } finally {
    key.fill(0)
    plaintext.fill(0)
  }
}

export async function decryptProtectedExport(text: string, password: string, expectedKind: ProtectedExportKind) {
  const envelope = readExport(text)
  if (!envelope) throw new Error("This is not a password-protected Money Manager export.")
  if (envelope.kind !== expectedKind) throw new Error("This protected file type does not match the selected action.")
  validateSitePassword(password)
  const key = await deriveEncryptionKey(password, decodeSalt(envelope.salt))
  try {
    const plaintext = openBytes(key, `${exportLabel}${expectedKind}`, { nonce: envelope.nonce, ciphertext: envelope.ciphertext }, MAX_BYTES)
    try { return new TextDecoder("utf-8", { fatal: true }).decode(plaintext) } catch {
      throw new Error("The protected file does not contain valid text.")
    } finally { plaintext.fill(0) }
  } finally { key.fill(0) }
}
