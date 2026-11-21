"use client"

import { useEffect, useRef, useState } from "react"
import { AccountTypeChoices, LedgerAccountForm } from "@/components/ledger-account-form"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { currencies, currencyDigits, money } from "@/lib/finance"
import { accountDraftFor, type OnboardingDraft } from "@/lib/onboarding"
import { saveOnboarding } from "@/lib/storage"
import { cn } from "@/lib/utils"

const quickCurrencies = [["EUR", "€"], ["USD", "$"], ["GBP", "£"]] as const
const currencyNames = new Intl.DisplayNames(["en-GB"], { type: "currency" })
const currencyOptions = [...new Set([...quickCurrencies.map(([code]) => code), ...currencies])].map(code => [
  code, code + " — " + (currencyNames.of(code) ?? code) + (code === "BGN" ? " (historic)" : ""),
] as const)
const enter = "motion-safe:full-motion:animate-in motion-safe:full-motion:fade-in motion-safe:full-motion:slide-in-from-bottom-1 motion-safe:full-motion:duration-150 motion-safe:full-motion:ease-out"
const press = "motion-safe:full-motion:transition-transform motion-safe:full-motion:duration-100 motion-safe:full-motion:ease-out motion-safe:full-motion:active:scale-[.97]"
const quiet = "h-11 text-muted-foreground"

export function Onboarding({ initial, finish, reload }: {
  initial: OnboardingDraft
  finish: (draft: OnboardingDraft, destination: "skip" | "dashboard") => Promise<void>
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
  const choices = useRef<HTMLDivElement>(null)
  const focusEditor = useRef(false)
  const focusAdd = useRef(false)
  const setupEditing = draft.editor !== null
  const { currency, theme } = draft.preferences
  const customCurrency = !quickCurrencies.some(([code]) => code === currency)

  useEffect(() => {
    if (setupEditing && focusEditor.current) {
      const selected = editor.current?.querySelector<HTMLInputElement>('input[name="name"]')
      if (selected) {
        focusEditor.current = false
        selected.focus()
      }
    }
    if (!setupEditing && focusAdd.current) {
      focusAdd.current = false
      choices.current?.querySelector("button")?.focus()
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

  async function leave(destination: "skip" | "dashboard") {
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

  return <Dialog open>
    <DialogContent showCloseButton={false} overlayClassName="bg-black/30 max-md:bg-background"
      className="block max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain rounded-xl p-6 md:max-w-[30rem] md:p-7 max-md:inset-0 max-md:h-dvh max-md:max-h-none max-md:max-w-none max-md:translate-none max-md:rounded-none max-md:border-0 max-md:pt-[max(2rem,env(safe-area-inset-top))] max-md:pb-[max(2rem,env(safe-area-inset-bottom))] max-md:data-[state=open]:zoom-in-100"
      onOpenAutoFocus={event => {
        event.preventDefault()
        if (!setupEditing) heading.current?.focus({ preventScroll: true })
        else editor.current?.querySelector<HTMLButtonElement>('button[aria-pressed="true"]')?.focus()
      }}
      onCloseAutoFocus={event => event.preventDefault()}
      onPointerDownOutside={event => event.preventDefault()}
      onEscapeKeyDown={event => {
        event.preventDefault()
        if (draft.editor) {
          focusAdd.current = true
          update({ ...draft, editor: null })
        } else void leave("skip")
      }}>
      <div className="mx-auto w-full max-w-md">
        <header>
          <DialogTitle ref={heading} tabIndex={-1}
            className="text-[2rem]/[1.12] font-semibold tracking-[-0.03em] text-foreground outline-none md:text-4xl/[1.12]">
            Hi there
          </DialogTitle>
          <DialogDescription className="mt-2 text-[0.9375rem]/[1.5]">Let’s set up Baran’s Money Manager.</DialogDescription>
        </header>

        <section aria-labelledby="setup-currency" className="mt-4">
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
                className={cn("group h-11 min-w-0 justify-start gap-1.5 px-2.5 shadow-none sm:gap-2 sm:px-3", press,
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
          <h2 id="setup-accounts" className="text-base font-semibold">{draft.accounts.length ? "Your accounts" : "Add an account"}</h2>
          <p className="mt-1.5 text-[13px] text-muted-foreground">
            {setupEditing ? "Give it a name you’ll recognise."
              : draft.accounts.length ? "Choose a type to add another." : "You can add accounts later."}
          </p>
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
          </div> : <div ref={choices} className="mt-3">
            <AccountTypeChoices disabled={busy} choose={type => { focusEditor.current = true; update({ ...draft, editor: accountDraftFor(type) }) }} />
          </div>}
        </section>

        <div className="mt-5 flex flex-col gap-2 md:flex-row-reverse md:justify-between">
          {!setupEditing && <Button type="button" className={cn("h-11 active:bg-primary/85", press)} disabled={busy}
            onClick={() => void leave("dashboard")}>Open dashboard</Button>}
          <Button type="button" variant="ghost" className={cn(quiet, setupEditing && "md:mr-auto")} disabled={busy}
            onClick={() => void leave("skip")}>Skip setup</Button>
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">No sign-up. Your data stays in this browser.</p>
        {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
      </div>
    </DialogContent>
  </Dialog>
}
