"use client"

import { useEffect, useId, useRef, useState } from "react"
import { ChevronDown, Plus } from "lucide-react"
import { LedgerAccountForm } from "@/components/ledger-account-form"
import { Choose } from "@/components/shared"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { currencies, currencyDigits, defaultPreferences, money, type Theme } from "@/lib/finance"
import { newAccountDraft, type OnboardingDraft } from "@/lib/onboarding"
import { localeOptions } from "@/lib/regional-options"
import { saveOnboarding } from "@/lib/storage"
import { cn } from "@/lib/utils"

const quickCurrencies = [["EUR", "€"], ["USD", "$"], ["GBP", "£"]] as const
const currencyNames = new Intl.DisplayNames(["en-GB"], { type: "currency" })
const currencyOptions = [...new Set([...quickCurrencies.map(([code]) => code), ...currencies])].map(code => [
  code, code + " — " + (currencyNames.of(code) ?? code) + (code === "BGN" ? " (historic)" : ""),
] as const)
const formatOptions = localeOptions.filter(([tag]) => tag !== "custom")
const themes: readonly [Theme, string][] = [["system", "System"], ["light", "Light"], ["dark", "Dark"]]
const enter = "motion-safe:full-motion:animate-in motion-safe:full-motion:fade-in motion-safe:full-motion:slide-in-from-bottom-1 motion-safe:full-motion:duration-150 motion-safe:full-motion:ease-out"
const press = "motion-safe:full-motion:transition-transform motion-safe:full-motion:duration-100 motion-safe:full-motion:ease-out motion-safe:full-motion:active:scale-[.97]"
const quiet = "h-11 text-muted-foreground"

export function Onboarding({ initial, finish, reload }: {
  initial: OnboardingDraft
  finish: (draft: OnboardingDraft, destination: "skip" | "dashboard" | "transaction") => Promise<void>
  reload: () => Promise<void>
}) {
  const [draft, setDraft] = useState(initial)
  const [error, setError] = useState("")
  const [currencyError, setCurrencyError] = useState("")
  const [accountStatus, setAccountStatus] = useState("")
  const [busy, setBusy] = useState(false)
  const lastWrite = useRef(Promise.resolve())
  const revision = useRef(0)
  const submitting = useRef(false)
  const heading = useRef<HTMLHeadingElement>(null)
  const editor = useRef<HTMLDivElement>(null)
  const addButton = useRef<HTMLButtonElement>(null)
  const focusEditor = useRef(Boolean(initial.editor))
  const focusAdd = useRef(false)
  const preferencesId = useId()
  const setupEditing = draft.editor !== null
  const { currency, locale, theme } = draft.preferences
  const customCurrency = !quickCurrencies.some(([code]) => code === currency)
  const changed = draft.accounts.length > 0 || currency !== defaultPreferences.currency || locale !== defaultPreferences.locale || theme !== "system"

  useEffect(() => {
    if (!focusEditor.current) heading.current?.focus({ preventScroll: true })
  }, [])
  useEffect(() => {
    if (setupEditing && focusEditor.current) {
      focusEditor.current = false
      editor.current?.querySelector<HTMLButtonElement>('button[aria-pressed="true"]')?.focus()
    }
    if (!setupEditing && focusAdd.current) {
      focusAdd.current = false
      addButton.current?.focus()
    }
  }, [setupEditing, draft.accounts.length])
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("money-manager-theme-preview", { detail: theme }))
  }, [theme])
  useEffect(() => () => { window.dispatchEvent(new Event("money-manager-theme-preview")) }, [])

  function update(next: OnboardingDraft) {
    const version = ++revision.current
    setDraft(next)
    setError("")
    setCurrencyError("")
    lastWrite.current = lastWrite.current.then(async () => {
      if (version !== revision.current) return
      try {
        if (!await saveOnboarding(next)) await reload()
      } catch {
        if (version === revision.current) setError("Your draft could not be saved. Try again before leaving this page.")
      }
    })
  }

  function changeCurrency(next: string) {
    if (next === currency) return
    if (draft.accounts.some(account => account.openingBalance !== 0)) {
      setCurrencyError("Remove accounts with an opening balance before changing currency.")
      return
    }
    if (draft.editor?.balance.trim()) {
      setCurrencyError("Clear the opening balance before changing currency.")
      return
    }
    update({ ...draft, preferences: { ...draft.preferences, currency: next, currencyDigits: currencyDigits(next) } })
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

  return <main id="main-content" className="min-h-dvh px-6 pt-8 pb-[max(2.5rem,env(safe-area-inset-bottom))] sm:pt-[4.75rem]">
    <div className="mx-auto max-w-md">
      <p className="text-sm font-semibold">Baran’s Money Manager</p>
      <header className="mt-8 sm:mt-9">
        <h1 ref={heading} tabIndex={-1}
          className="text-[clamp(2.75rem,13vw,3.125rem)] leading-[1.05] font-semibold tracking-[-0.04em] outline-none sm:text-6xl">
          Hello, <span className="text-primary">money.</span>
        </h1>
        <p className="mt-3.5 text-[15px] leading-relaxed text-muted-foreground sm:mt-4 sm:text-[17px]">Pick a currency. Add accounts if you like.</p>
      </header>

      <section aria-labelledby="setup-currency" className="mt-4 sm:mt-6">
        <div className="mb-1 flex min-h-11 items-center justify-between gap-2">
          <h2 id="setup-currency" className="text-[15px] font-semibold">Currency</h2>
          <Select value={currency} onValueChange={changeCurrency} disabled={busy}>
            <SelectTrigger aria-label="See all currencies" className="-mr-2 h-11 border-0 bg-transparent px-2 text-[13px] font-medium text-primary shadow-none data-[size=default]:h-11 dark:bg-transparent">
              See all
            </SelectTrigger>
            <SelectContent position="popper" align="end" collisionPadding={16} className="max-w-[calc(100vi_-_3rem)] sm:max-w-xs">
              {currencyOptions.map(([code, name]) => <SelectItem key={code} value={code}>{name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div role="group" aria-label="Quick currency choices" className="grid grid-cols-3 gap-2">
          {quickCurrencies.map(([code, symbol]) => {
            const active = code === currency
            return <Button key={code} type="button" variant={active ? "secondary" : "outline"} disabled={busy}
              className={cn("group h-[54px] min-w-0 justify-start gap-1.5 px-2.5 shadow-none sm:gap-2 sm:px-3", press,
                active ? "border border-primary text-primary" : "border-input bg-card dark:bg-card")}
              aria-pressed={active} aria-label={code + " — " + currencyNames.of(code)} onClick={() => changeCurrency(code)}>
              <span aria-hidden="true" className="text-xl leading-none motion-safe:full-motion:transition-transform motion-safe:full-motion:duration-150 motion-safe:full-motion:ease-out motion-safe:full-motion:group-aria-pressed:scale-105">{symbol}</span>
              <span className="text-[13px] font-semibold">{code}</span>
            </Button>
          })}
        </div>
        {customCurrency && <p role="status" className="mt-2 text-sm font-medium text-primary">{currencyOptions.find(([code]) => code === currency)?.[1] ?? currency}</p>}
        {currencyError && <p role="alert" className="mt-2 text-sm text-destructive">{currencyError}</p>}
      </section>

      <section aria-labelledby="setup-accounts" className="mt-5">
        <div className="flex items-center justify-between gap-2">
          <h2 id="setup-accounts" className="text-[15px] font-semibold">Accounts</h2>
          <p className="text-[13px] text-muted-foreground">Optional</p>
        </div>
        <p role="status" className="sr-only">{accountStatus}</p>
        {draft.accounts.length > 0 && <ul aria-label="Added accounts" className="mt-1">
          {draft.accounts.map(account => <li key={account.id} className={cn("flex min-h-12 items-center gap-2", enter)}>
            <span className="min-w-0 flex-1 [overflow-wrap:anywhere] text-sm font-medium">{account.name}</span>
            <span className="max-w-[45%] [overflow-wrap:anywhere] text-right text-sm tabular-nums text-muted-foreground">{money(account.openingBalance, draft.preferences)}</span>
            <Button type="button" variant="ghost" className={cn(quiet, "-mr-2 px-2")} aria-label={"Remove " + account.name}
              disabled={busy || setupEditing} onClick={() => {
                focusAdd.current = true
                setAccountStatus(account.name + " removed.")
                update({ ...draft, accounts: draft.accounts.filter(item => item.id !== account.id) })
              }}>Remove</Button>
          </li>)}
        </ul>}
        {draft.editor ? <div ref={editor} className={cn("mt-2", enter)}>
          <LedgerAccountForm inSetup draft={draft.editor} preferences={draft.preferences} accounts={draft.accounts}
            onChange={next => update({ ...draft, editor: next })}
            onSave={account => {
              focusAdd.current = true
              setAccountStatus(account.name + " added.")
              update({ ...draft, accounts: [...draft.accounts, account], editor: null })
            }}
            cancel={() => { focusAdd.current = true; update({ ...draft, editor: null }) }} />
        </div> : <Button ref={addButton} type="button" variant="ghost" className="mt-1 -ml-2 h-11 px-2 text-primary"
          disabled={busy} onClick={() => { focusEditor.current = true; update({ ...draft, editor: { ...newAccountDraft } }) }}>
          <Plus aria-hidden="true" />{draft.accounts.length ? "Add another account" : "Add an account"}
        </Button>}
      </section>

      {!setupEditing && <div className="mt-2 sm:mt-3">
        <Button type="button" variant="ghost" className="-ml-2 h-11 gap-1.5 px-2 text-[13px] text-muted-foreground"
          aria-controls={preferencesId} aria-expanded={draft.showPreferences} disabled={busy}
          onClick={() => update({ ...draft, showPreferences: !draft.showPreferences })}>
          Locale and appearance
          <ChevronDown aria-hidden="true" className={cn("size-3.5 motion-safe:full-motion:transition-transform motion-safe:full-motion:duration-150", draft.showPreferences && "rotate-180")} />
        </Button>
        <div id={preferencesId} hidden={!draft.showPreferences}>
          {draft.showPreferences && <div className={cn("mt-2 mb-4 space-y-4", enter)}>
            <Choose label="Formatting locale" value={locale} options={formatOptions} disabled={busy}
              triggerClassName="text-base data-[size=default]:h-[46px] dark:bg-card"
              onChange={selected => update({ ...draft, preferences: { ...draft.preferences, locale: selected } })} />
            <div role="group" aria-label="Appearance" className="grid gap-2">
              <p className="text-sm font-medium">Appearance</p>
              <div className="grid grid-cols-3 gap-2">{themes.map(([value, label]) =>
                <Button key={value} type="button" variant={theme === value ? "secondary" : "outline"} disabled={busy}
                  className={cn("h-11 px-2 shadow-none", theme === value ? "border border-primary text-primary" : "border-input bg-card dark:bg-card")}
                  aria-pressed={theme === value} onClick={() => update({ ...draft, preferences: { ...draft.preferences, theme: value } })}>{label}</Button>)}</div>
            </div>
            {changed && <Button type="button" variant="ghost" className={cn(quiet, "-ml-2 px-2")} disabled={busy}
              onClick={() => void leave("skip")}>Skip setup and use defaults</Button>}
          </div>}
        </div>
        <Button type="button" className={cn("mt-1 h-11 w-full active:bg-primary/85", press)} disabled={busy}
          onClick={() => void leave("dashboard")}>Start tracking</Button>
        <Button type="button" variant="ghost" className={cn("mt-1 w-full", quiet)} disabled={busy}
          onClick={() => void leave("transaction")}>Add first transaction</Button>
        <p className="mt-4 text-center text-xs text-muted-foreground">Stored in this browser. No sign-up.</p>
      </div>}
      {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
    </div>
  </main>
}
