import assert from "node:assert/strict"
import { test } from "node:test"
import {
  decryptProtectedExport,
  createSalt,
  deriveEncryptionKey,
  encryptProtectedExport,
  protectedExportKind,
  validateSitePassword,
} from "../src/lib/security.ts"

test("protected exports hide their contents and round-trip by file type", async () => {
  const contents = '{"app":"money-manager","records":["private-ledger"]}'
  const protectedFile = await encryptProtectedExport(contents, "a-long-passphrase-for-testing", "backup")

  assert.equal(protectedExportKind(protectedFile), "backup")
  assert.equal(protectedFile.includes("private-ledger"), false)
  assert.equal(await decryptProtectedExport(protectedFile, "a-long-passphrase-for-testing", "backup"), contents)
})

test("protected CSV exports round-trip without becoming a plaintext spreadsheet", async () => {
  const csv = 'date,amount,description\n2026-01-02,12.50,"Local shop"'
  const protectedFile = await encryptProtectedExport(csv, "a-long-passphrase-for-testing", "csv")

  assert.equal(protectedExportKind(protectedFile), "csv")
  assert.equal(protectedFile.includes("Local shop"), false)
  assert.equal(await decryptProtectedExport(protectedFile, "a-long-passphrase-for-testing", "csv"), csv)
})

test("protected exports reject wrong passwords, wrong file types, and altered ciphertext", async () => {
  const protectedFile = await encryptProtectedExport("date,amount\n2026-01-01,10", "another-long-passphrase", "csv")

  await assert.rejects(decryptProtectedExport(protectedFile, "incorrect-long-passphrase", "csv"))
  await assert.rejects(decryptProtectedExport(protectedFile, "another-long-passphrase", "backup"), /file type/i)

  const envelope = JSON.parse(protectedFile)
  envelope.ciphertext = `${envelope.ciphertext.slice(0, -2)}AA`
  await assert.rejects(decryptProtectedExport(JSON.stringify(envelope), "another-long-passphrase", "csv"))
})

test("protected exports reject unsupported or expensive envelope parameters before deriving a key", async () => {
  const protectedFile = await encryptProtectedExport("backup", "another-long-passphrase", "backup")
  const envelope = JSON.parse(protectedFile)
  envelope.iterations = 2_147_483_647

  assert.throws(() => protectedExportKind(JSON.stringify(envelope)), /unsupported/i)
  await assert.rejects(decryptProtectedExport(JSON.stringify(envelope), "another-long-passphrase", "backup"), /unsupported/i)
})

test("protected exports reject duplicate envelope fields", async () => {
  const protectedFile = await encryptProtectedExport("private", "another-long-passphrase", "backup")
  const duplicated = protectedFile.replace('"kind":"backup"', '"kind":"backup","kind":"backup"')

  assert.throws(() => protectedExportKind(duplicated), /valid format/i)
})

test("native and insecure-context password derivation produce the same key", async () => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, "isSecureContext")
  const salt = createSalt()
  const nativeKey = await deriveEncryptionKey("a-long-passphrase-for-testing", salt)
  try {
    Object.defineProperty(globalThis, "isSecureContext", { configurable: true, value: false })
    const fallbackKey = await deriveEncryptionKey("a-long-passphrase-for-testing", salt)
    assert.deepEqual(fallbackKey, nativeKey)
    fallbackKey.fill(0)
  } finally {
    nativeKey.fill(0)
    if (descriptor) Object.defineProperty(globalThis, "isSecureContext", descriptor)
    else delete globalThis.isSecureContext
  }
})

test("site password validation requires a passphrase and bounds its size", () => {
  assert.throws(() => validateSitePassword("short"), /12 characters/i)
  assert.throws(() => validateSitePassword("x".repeat(129)), /128 characters/i)
  assert.equal(validateSitePassword("   long enough passphrase   "), "   long enough passphrase   ")
})
