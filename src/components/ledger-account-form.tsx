"use client"

import { useId, useRef, useState, type FormEvent } from "react"
import { Choose, Field } from "@/components/shared"
import { Button } from "@/components/ui/button"
import { accountNameKey, accountTypes, amountInput, maxLedgerAccounts, openingBalanceFromText, type LedgerAccount, type Preferences } from "@/lib/finance"
import { type AccountDraft } from "@/lib/onboarding"
import { cn } from "@/lib/utils"

const options = accountTypes.map(type => [type, type] as const)
const defaultName = { Cash: "Cash", Bank: "Bank account", Other: "" }

export function LedgerAccountForm({ draft, onChange, preferences, accounts, onSave, cancel, editing, stacked = false }: {
  draft: AccountDraft
  onChange: (draft: AccountDraft) => void
  preferences: Preferences
  accounts: LedgerAccount[]
  onSave: (account: LedgerAccount) => void | Promise<void>
  cancel: () => void
  editing?: LedgerAccount
  stacked?: boolean
}) {
  const [error, setError] = useState<{ field?: "name" | "balance"; message: string }>()
  const [busy, setBusy] = useState(false)
  const submitting = useRef(false)
  const errorId = useId()

  function change(patch: Partial<AccountDraft>) {
    setError(undefined)
    onChange({ ...draft, ...patch })
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting.current) return
    const form = event.currentTarget
    const name = draft.name.trim()
    function invalid(field: "name" | "balance", message: string) {
      setError({ field, message })
      form.querySelector<HTMLInputElement>(`[name="${field}"]`)?.focus()
    }
    if (!name) { invalid("name", "Enter an account name."); return }
    if (/[\u0000-\u001f\u007f]/u.test(name)) { invalid("name", "Enter a name that fits on one line."); return }
    if (accounts.some(account => account.id !== editing?.id && accountNameKey(account.name) === accountNameKey(name))) {
      invalid("name", "An account with this name already exists.")
      return
    }
    if (!editing && accounts.length >= maxLedgerAccounts) {
      setError({ message: `A ledger can contain up to ${maxLedgerAccounts} accounts.` })
      return
    }
    let openingBalance: number
    try { openingBalance = openingBalanceFromText(draft.balance, preferences) }
    catch (problem) {
      invalid("balance", problem instanceof Error ? problem.message : "Enter a valid opening balance.")
      return
    }
    submitting.current = true
    setBusy(true)
    try {
      const id = editing?.id ?? Array.from(crypto.getRandomValues(new Uint8Array(16)), byte => byte.toString(16).padStart(2, "0")).join("")
      await onSave({ id, type: draft.type, name, openingBalance })
    } catch (problem) {
      setError({ message: problem instanceof Error ? problem.message : "The account could not be saved. Try again." })
    } finally {
      submitting.current = false
      setBusy(false)
    }
  }

  const errorText = error ? <p id={errorId} role="alert" className="text-sm text-destructive">{error.message}</p> : null
  return <form className="grid gap-4" onSubmit={save} noValidate>
    <Choose label="Account type" value={draft.type} options={options} triggerClassName="text-base data-[size=default]:h-[46px] dark:bg-card" disabled={busy}
      onChange={value => {
        const type = accountTypes.find(item => item === value)
        if (type) change({ type, name: !editing && draft.name === defaultName[draft.type] ? defaultName[type] : draft.name })
      }} />
    <div className="grid gap-2">
      <Field label="Account name" name="name" className="h-[46px] bg-card dark:bg-card" value={draft.name} autoComplete="off" required maxLength={70} disabled={busy}
        aria-invalid={error?.field === "name" || undefined} aria-describedby={error?.field === "name" ? errorId : undefined}
        onChange={event => change({ name: event.target.value })} />
      {error?.field === "name" && errorText}
    </div>
    <div className="grid gap-2">
      <Field label="Opening balance (optional)" name="balance" className="h-[46px] bg-card dark:bg-card" value={draft.balance} inputMode="decimal" autoComplete="off"
        placeholder={amountInput(0, preferences)} maxLength={64} disabled={busy} aria-invalid={error?.field === "balance" || undefined}
        aria-describedby={error?.field === "balance" ? errorId : undefined} onChange={event => change({ balance: event.target.value })} />
      {error?.field === "balance" && errorText}
    </div>
    {error && !error.field && errorText}
    <div className={cn("mt-1 flex gap-3", stacked ? "flex-col" : "flex-wrap justify-end")}>
      <Button type="submit" className="h-11" disabled={busy}>{busy ? "Saving…" : editing ? "Save account" : "Add account"}</Button>
      <Button type="button" variant="ghost" className="h-11 text-muted-foreground" disabled={busy} onClick={cancel}>Cancel</Button>
    </div>
  </form>
}
