"use client"

import { useContext, useState } from "react"
import { TourEditorContext } from "@/components/app-tour"
import { LedgerAccountForm } from "@/components/ledger-account-form"
import type { Commit } from "@/components/shared"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { accountNameKey, amountInput, money, type Data, type LedgerAccount } from "@/lib/finance"
import { newAccountDraft, type AccountDraft } from "@/lib/onboarding"

export function LedgerAccounts({ data, commit, onEditorChange }: { data: Data; commit: Commit; onEditorChange: (active: boolean) => void }) {
  const accounts = data.accounts ?? []
  const [editor, setEditor] = useState<{ draft: AccountDraft; account?: LedgerAccount }>()
  const coach = useContext(TourEditorContext)

  function select(account?: LedgerAccount) {
    setEditor({
      account,
      draft: account ? { type: account.type, name: account.name, balance: amountInput(account.openingBalance, data.preferences) } : { ...newAccountDraft },
    })
    onEditorChange(true)
  }

  function closeEditor() {
    setEditor(undefined)
    onEditorChange(false)
  }

  async function save(account: LedgerAccount) {
    const previous = editor?.account
    await commit(current => {
      const existing = current.accounts ?? []
      if (current.preferences.currency !== data.preferences.currency || current.preferences.currencyDigits !== data.preferences.currencyDigits) {
        throw new Error("The ledger currency changed. Close the form and try again.")
      }
      if (previous && !existing.some(item => item.id === previous.id && item.name === previous.name &&
        item.type === previous.type && item.openingBalance === previous.openingBalance)) {
        throw new Error("This account changed in another tab. Close the form and try again.")
      }
      const entries = previous && previous.name !== account.name ? current.entries.map(entry =>
        accountNameKey(entry.account) === accountNameKey(previous.name) ? { ...entry, account: account.name } : entry) : current.entries
      return { ...current, entries, accounts: previous ? existing.map(item => item.id === account.id ? account : item) : [...existing, account] }
    }, previous ? "Account updated" : "Account added")
    closeEditor()
  }

  return <div className="grid gap-4">
    {accounts.length > 0 && <Card className="gap-0 divide-y py-0 shadow-none">
      {accounts.map(account => <div key={account.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="[overflow-wrap:anywhere] font-medium">{account.name}</p>
          <p className="text-sm text-muted-foreground">{account.type} · Opening balance {money(account.openingBalance, data.preferences)}</p>
        </div>
        <Button variant="outline" className="min-h-11" aria-label={`Edit ${account.name}`} disabled={Boolean(editor)} onClick={() => select(account)}>Edit</Button>
      </div>)}
    </Card>}
    {editor ? <Card className="gap-3 p-4 shadow-none">
      <h2 className="font-semibold">{editor.account ? "Edit account" : "Add an account"}</h2>
      {coach?.scope === "account" && coach.panel}
      <LedgerAccountForm draft={editor.draft} onChange={draft => setEditor({ ...editor, draft })} editing={editor.account}
        accounts={accounts} preferences={data.preferences} onSave={save} cancel={closeEditor} />
    </Card> : <Button data-tour-target="ledger-accounts" variant="outline" className="min-h-11 justify-self-start" onClick={() => select()}>Add an account</Button>}
  </div>
}
