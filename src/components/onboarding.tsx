"use client"

import { useEffect, useId, useRef, useState } from "react"
import { ChevronDown } from "lucide-react"
import { LedgerAccountForm } from "@/components/ledger-account-form"
import { Choose } from "@/components/shared"
import { Button } from "@/components/ui/button"
import { currencies, currencyDigits, money, type Theme } from "@/lib/finance"
import { newAccountDraft, type OnboardingDraft } from "@/lib/onboarding"
import { localeOptions } from "@/lib/regional-options"
import { saveOnboarding } from "@/lib/storage"

const commonCurrencies = ["EUR", "USD", "GBP", "BGN", "TRY"]
const currencyNames = new Intl.DisplayNames(["en-GB"], { type: "currency" })
const currencyOptions = [...new Set([...commonCurrencies, ...currencies])].map(code => [
  code, `${code} · ${currencyNames.of(code) ?? code}${code === "BGN" ? " (historic)" : ""}`,
] as const)
const formatOptions = localeOptions.filter(([tag]) => tag !== "custom")
const themes: readonly [Theme, string][] = [["system", "System"], ["light", "Light"], ["dark", "Dark"]]
const primary = "h-11 w-full active:bg-primary/85"
const quiet = "h-11 text-muted-foreground"
const selectStyle = "text-base data-[size=default]:h-[46px] dark:bg-card"

export function Onboarding({ initial, finish, reload }: {
  initial: OnboardingDraft
  finish: (draft: OnboardingDraft, destination: "skip" | "dashboard" | "transaction") => Promise<void>
  reload: () => Promise<void>
}) {
  const [draft, setDraft] = useState(initial)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const lastWrite = useRef(Promise.resolve())
  const revision = useRef(0)
  const submitting = useRef(false)
  const heading = useRef<HTMLHeadingElement>(null)
  const addButton = useRef<HTMLButtonElement>(null)
  const focusEditor = useRef(false)
  const focusAdd = useRef(false)
  const preferencesId = useId()
  const accountsStep = draft.step === "accounts"
  const editing = draft.editor !== null

  useEffect(() => { heading.current?.focus({ preventScroll: true }) }, [accountsStep])
  useEffect(() => {
    if (editing && focusEditor.current) {
      focusEditor.current = false
      document.getElementById("setup-editor")?.querySelector<HTMLElement>('[role="combobox"]')?.focus()
    }
    if (!editing && focusAdd.current) {
      focusAdd.current = false
      addButton.current?.focus()
    }
  }, [editing])
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("money-manager-theme-preview", { detail: draft.preferences.theme }))
  }, [draft.preferences.theme])
  useEffect(() => () => { window.dispatchEvent(new Event("money-manager-theme-preview")) }, [])

  function update(next: OnboardingDraft) {
    const version = ++revision.current
    setDraft(next)
    setError("")
    lastWrite.current = lastWrite.current.then(async () => {
      if (version !== revision.current) return
      try {
        if (!await saveOnboarding(next)) await reload()
      } catch {
        if (version === revision.current) setError("Your draft could not be saved. Try again before leaving this page.")
      }
    })
  }

  function changeCurrency(currency: string) {
    if (currency === draft.preferences.currency) return
    if (draft.accounts.some(account => account.openingBalance !== 0)) {
      setError("Remove accounts with an opening balance before changing the currency.")
      return
    }
    update({ ...draft, preferences: { ...draft.preferences, currency, currencyDigits: currencyDigits(currency) } })
  }

  async function leave(destination: "skip" | "dashboard" | "transaction") {
    if (submitting.current) return
    submitting.current = true
    setBusy(true)
    setError("")
    try {
      await lastWrite.current
      await finish(draft, destination)
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "Setup could not be saved. Try again.")
    } finally {
      submitting.current = false
      setBusy(false)
    }
  }

  return <main id="main-content" className="min-h-dvh px-6 pt-10 pb-[max(2.5rem,env(safe-area-inset-bottom))] sm:pt-[5.75rem]">
    <div className="mx-auto max-w-[22rem]">
      <p className="text-center text-sm font-semibold">Baran’s Money Manager</p>
      <section key={draft.step} aria-labelledby="setup-heading"
        className="mt-9 motion-safe:full-motion:animate-in motion-safe:full-motion:fade-in motion-safe:full-motion:slide-in-from-bottom-1 motion-safe:full-motion:duration-150 sm:mt-[4.5rem]">
        <p className="text-center text-xs font-medium tabular-nums text-muted-foreground">{accountsStep ? "2" : "1"} of 2</p>
        <h1 ref={heading} id="setup-heading" tabIndex={-1}
          className="mt-3 text-center text-[clamp(2.2rem,10vw,2.5rem)] leading-[1.1] font-semibold tracking-[-0.034em] outline-none sm:text-[2.9375rem]">
          {accountsStep ? "Your accounts" : "Your currency"}
        </h1>
        {accountsStep ? <>
          {draft.editor ? <div id="setup-editor" className="mt-10">
            <LedgerAccountForm stacked draft={draft.editor} preferences={draft.preferences} accounts={draft.accounts}
              onChange={editor => update({ ...draft, editor })}
              onSave={account => { focusAdd.current = true; update({ ...draft, accounts: [...draft.accounts, account], editor: null }) }}
              cancel={() => { focusAdd.current = true; update({ ...draft, editor: null }) }} />
          </div> : <>
            <p className="mt-3 text-center text-sm text-muted-foreground">You can add accounts later.</p>
            <div className="mt-5">
              {draft.accounts.length > 0 && <ul aria-label="Added accounts" className="mb-2">
                {draft.accounts.map(account => <li key={account.id} className="flex min-h-12 items-center gap-2">
                  <span className="min-w-0 flex-1 [overflow-wrap:anywhere] text-sm font-medium">{account.name}</span>
                  <span className="max-w-[45%] [overflow-wrap:anywhere] text-right text-sm tabular-nums text-muted-foreground">{money(account.openingBalance, draft.preferences)}</span>
                  <Button type="button" variant="ghost" className={quiet} disabled={busy} aria-label={`Remove ${account.name}`}
                    onClick={() => update({ ...draft, accounts: draft.accounts.filter(item => item.id !== account.id) })}>Remove</Button>
                </li>)}
              </ul>}
              <Button ref={addButton} type="button" variant="outline" className="h-11 w-full border-input bg-card shadow-none dark:bg-card" disabled={busy}
                onClick={() => { focusEditor.current = true; update({ ...draft, editor: { ...newAccountDraft } }) }}>
                {draft.accounts.length ? "Add another account" : "Add an account"}
              </Button>
              <Button type="button" className={`mt-[18px] ${primary}`} disabled={busy} onClick={() => void leave("dashboard")}>Open dashboard</Button>
              <div className="mt-3 flex flex-wrap justify-between gap-x-2">
                <Button type="button" variant="ghost" className={`${quiet} -ml-3 px-3`} disabled={busy}
                  onClick={() => update({ ...draft, step: "currency" })}>Back</Button>
                <Button type="button" variant="ghost" className={`${quiet} -mr-3 px-3`} disabled={busy}
                  onClick={() => void leave("transaction")}>Add first transaction</Button>
              </div>
            </div>
          </>}
        </> : <div className="mt-10 sm:mt-12">
          <Choose label="Currency" value={draft.preferences.currency} options={currencyOptions} triggerClassName={selectStyle} disabled={busy} onChange={changeCurrency} />
          <Button type="button" variant="ghost" className="mt-2 -ml-2 h-11 gap-1.5 px-2 text-[13px] text-muted-foreground"
            aria-controls={preferencesId} aria-expanded={draft.showPreferences} disabled={busy}
            onClick={() => update({ ...draft, showPreferences: !draft.showPreferences })}>
            Locale and appearance
            <ChevronDown aria-hidden="true" className={`size-3.5 transition-transform duration-150 ${draft.showPreferences ? "rotate-180" : ""}`} />
          </Button>
          <div id={preferencesId} hidden={!draft.showPreferences} className="mt-3 space-y-4">
            <Choose label="Formatting locale" value={draft.preferences.locale} options={formatOptions} triggerClassName={selectStyle} disabled={busy}
              onChange={locale => update({ ...draft, preferences: { ...draft.preferences, locale } })} />
            <div role="group" aria-label="Appearance" className="grid gap-2">
              <p className="text-sm font-medium">Appearance</p>
              <div className="grid grid-cols-3 gap-2">{themes.map(([theme, label]) =>
                <Button key={theme} type="button" variant={draft.preferences.theme === theme ? "secondary" : "outline"} className="h-11 px-2 shadow-none"
                  aria-pressed={draft.preferences.theme === theme} disabled={busy}
                  onClick={() => update({ ...draft, preferences: { ...draft.preferences, theme } })}>{label}</Button>)}</div>
            </div>
          </div>
          <Button type="button" className={`mt-3 ${primary}`} disabled={busy} onClick={() => update({ ...draft, step: "accounts" })}>Continue</Button>
          <Button type="button" variant="ghost" className={`mt-3 w-full ${quiet}`} disabled={busy} onClick={() => void leave("skip")}>Skip setup</Button>
          <p className="mt-5 text-center text-xs text-muted-foreground">Stored in this browser. No sign-up.</p>
        </div>}
        {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
      </section>
    </div>
  </main>
}
