import { expect, test } from "@playwright/test"
import { initialData, today } from "../../src/lib/finance.ts"

test("settings and an unfinished account survive refresh and the first transaction uses the saved account", async ({ page }, info) => {
  await page.setViewportSize({ width: 320, height: 740 })
  const externalRequests: string[] = []
  page.on("request", request => {
    if (!request.url().startsWith("http://127.0.0.1:3210/") || request.method() !== "GET") externalRequests.push(request.url())
  })
  await page.goto("/")
  await expect(page.getByRole("heading", { name: "Hello, money." })).toBeFocused()
  await expect(page.getByRole("button", { name: "EUR — Euro" })).toHaveAttribute("aria-pressed", "true")
  await page.getByRole("combobox", { name: "See all currencies" }).click()
  const list = await page.getByRole("listbox").boundingBox()
  if (!list) throw new Error("The currency list was not visible.")
  expect(list.x).toBeGreaterThanOrEqual(0)
  expect(list.x + list.width).toBeLessThanOrEqual(320)
  await page.getByRole("option", { name: "JPY — Japanese Yen" }).click()
  await expect(page.getByRole("status").filter({ hasText: "JPY — Japanese Yen" })).toBeVisible()
  const usd = page.getByRole("button", { name: "USD — US Dollar" })
  await usd.focus()
  await page.keyboard.press("Space")
  await expect(usd).toHaveAttribute("aria-pressed", "true")
  expect(await usd.evaluate(button => getComputedStyle(button).transitionDuration)).toBe("0s")
  await page.getByRole("button", { name: "Locale and appearance" }).click()
  await page.getByRole("combobox", { name: "Formatting locale" }).click()
  await page.getByRole("option", { name: /en-US$/ }).click()
  await page.getByRole("button", { name: "Dark", exact: true }).click()
  await expect(page.locator("html")).toHaveClass(/dark/)
  await page.getByRole("button", { name: "Add an account", exact: true }).click()
  await expect(page.getByRole("button", { name: "Cash", exact: true })).toBeFocused()
  await page.getByRole("button", { name: "Add account", exact: true }).click()
  await expect(page.getByText("Cash", { exact: true })).toBeVisible()
  await page.getByRole("button", { name: "Remove Cash" }).click()
  await page.getByRole("button", { name: "Add an account", exact: true }).click()
  await page.getByRole("button", { name: "Bank", exact: true }).click()
  const name = page.getByRole("textbox", { name: "Account name" })
  const balance = page.getByRole("textbox", { name: "Opening balance (optional)" })
  await expect(name).toHaveValue("Bank account")
  await name.fill("")
  await page.getByRole("button", { name: "Add account", exact: true }).click()
  await expect(name).toBeFocused()
  await expect(name).toHaveAccessibleDescription("Enter an account name.")
  await name.fill("Everyday account")
  await page.getByRole("button", { name: "Add an opening balance", exact: true }).click()
  await expect(balance).toBeFocused()
  await balance.fill("-45.50")
  await expect.poll(() => page.evaluate(() => new Promise(resolve => {
    const database = indexedDB.open("money-manager")
    database.onsuccess = () => {
      const db = database.result
      const request = db.transaction("snapshots").objectStore("snapshots").get("first-time-setup")
      request.onsuccess = () => { resolve(request.result?.editor?.balance); db.close() }
      request.onerror = () => { resolve(null); db.close() }
    }
    database.onerror = () => resolve(null)
  }))).toBe("-45.50")
  await page.reload()
  await expect(name).toHaveValue("Everyday account")
  await expect(balance).toHaveValue("-45.50")
  await expect(page.locator("html")).toHaveClass(/dark/)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320)
  await page.screenshot({ path: info.outputPath("onboarding-dark-320.png"), fullPage: true })
  await page.getByRole("button", { name: "Add account", exact: true }).click()
  await expect(usd).toHaveAttribute("aria-pressed", "true")
  await page.getByRole("button", { name: "Add first transaction", exact: true }).click()
  await expect(page.getByRole("dialog")).toBeVisible()
  await expect(page.getByLabel("Account", { exact: true })).toHaveValue("Everyday account")
  await page.goto("/#ledger-accounts")
  await expect(page.getByRole("heading", { name: "Accounts", exact: true })).toBeVisible()
  await expect(page.getByText("Bank · Opening balance -$45.50")).toBeVisible()
  await page.getByRole("button", { name: "Edit Everyday account" }).click()
  await page.getByRole("textbox", { name: "Opening balance (optional)" }).fill("15.00")
  await page.getByRole("button", { name: "Save account", exact: true }).click()
  await expect(page.getByText("Bank · Opening balance $15.00")).toBeVisible()
  expect(externalRequests).toEqual([])
})

test("a fresh browser can start with defaults and the centred desktop layout has no brand icon", async ({ page }, info) => {
  await page.setViewportSize({ width: 1200, height: 800 })
  await page.emulateMedia({ reducedMotion: "no-preference" })
  await page.goto("/")
  const step = page.getByRole("heading", { name: "Hello, money." })
  await expect(step).toBeVisible()
  const column = await page.getByRole("group", { name: "Quick currency choices" }).boundingBox()
  expect(column?.width).toBe(448)
  expect(column?.x).toBe(376)
  expect(column?.height).toBe(54)
  const euro = page.getByRole("button", { name: "EUR — Euro" })
  expect(await euro.evaluate(button => getComputedStyle(button).transitionProperty)).toContain("transform")
  await expect(page.getByText("Baran’s Money Manager", { exact: true }).locator("svg")).toHaveCount(0)
  await page.screenshot({ path: info.outputPath("onboarding-light-desktop.png") })
  await page.getByRole("button", { name: "Start tracking", exact: true }).click()
  await expect(page.getByRole("heading", { name: "Overview", exact: true })).toBeVisible()
  await page.reload()
  await expect(page.getByRole("heading", { name: "Overview", exact: true })).toBeVisible()
  await expect(step).toHaveCount(0)
})

test("older ledgers open without setup and keep their local transaction", async ({ page }) => {
  await page.goto("/privacy")
  const legacy = initialData()
  legacy.entries.push({
    id: "existing-entry", name: "Existing cash expense", amount: 100, kind: "expense", date: today(), category: "dining", account: "Cash", notes: "",
  })
  await page.evaluate(data => new Promise<void>((resolve, reject) => {
    const request = indexedDB.open("money-manager", 1)
    request.onupgradeneeded = () => { request.result.createObjectStore("snapshots") }
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction("snapshots", "readwrite")
      transaction.objectStore("snapshots").put(data, "current")
      transaction.oncomplete = () => { db.close(); resolve() }
      transaction.onabort = () => { db.close(); reject(transaction.error) }
    }
  }), legacy)
  await page.goto("/#activity")
  await expect(page.getByRole("heading", { name: "Activity", exact: true })).toBeVisible()
  await expect(page.getByRole("table", { name: "Transactions" }).getByRole("row", { name: /Existing cash expense/ })).toBeVisible()
  await expect(page.getByRole("heading", { name: "Hello, money." })).toHaveCount(0)
})
