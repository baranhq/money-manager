"use client"

import { useState, type FormEvent, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CategoryIcon, Choose, ErrorText, Field, FormActions, Modal, formValues, useOperation, type Commit } from "@/components/shared"
import { amountFromText, colours, exactAmount, icons, today, upsert, type Budget, type Category, type Contribution, type Data, type Entry, type Goal, type Kind } from "@/lib/finance"

type Shared = { data: Data; close: () => void; commit: Commit }
const local = "Saved in this browser on this device."
const kindOptions = [["expense", "Expense"], ["income", "Income"]] as const
const options = (values: readonly string[]) => values.map(value => [value, value.charAt(0).toUpperCase() + value.slice(1)] as const)

function RecordForm({ title, description = local, close, children, save, label }: {
  title: string; description?: string; close: () => void; children: ReactNode
  save: (values: (name: string) => string) => Promise<unknown>; label: string
}) {
  const operation = useOperation(close)
  const [dirty, setDirty] = useState(false)
  const [discard, setDiscard] = useState(false)
  function requestClose() {
    if (!dirty) return true
    setDiscard(true)
    return false
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    const values = formValues(event)
    void operation.run(() => save(values))
  }
  return <Modal title={title} description={description} close={close} busy={operation.busy}
    beforeClose={() => { if (discard) { setDiscard(false); return false } return requestClose() }}>
    <form className={discard ? "hidden" : "grid gap-4"} onSubmit={submit} onChange={() => setDirty(true)}
      onClick={event => { if ((event.target as HTMLElement).closest('[role="combobox"], [role="tab"]')) setDirty(true) }}>
      {children}
      <ErrorText message={operation.error} />
      <FormActions label={label} busy={operation.busy} cancel={() => { if (requestClose()) close() }} />
    </form>
    {discard && <div role="group" aria-label="Discard unsaved changes?" className="grid gap-3">
      <p>Discard unsaved changes?</p><div className="flex justify-end gap-2">
        <Button variant="outline" ref={element => element?.focus()} onClick={() => setDiscard(false)}>Keep editing</Button>
        <Button variant="destructive" onClick={close}>Discard changes</Button>
      </div>
    </div>}
  </Modal>
}

function Amount({ currency, amount, label = "Amount" }: { currency: string; amount?: number; label?: string }) {
  return <Field name="amount" label={`${label} (${currency})`} required inputMode="decimal" maxLength={12} placeholder="0.00" defaultValue={amount ? exactAmount(amount) : ""} />
}

export function EntryForm({ row, initialKind = "expense", ...props }: Shared & { row?: Entry; initialKind?: Kind }) {
  const { data, close, commit } = props
  const [kind, setKind] = useState<Kind>(row?.kind ?? initialKind)
  const [category, setCategory] = useState(row?.category ?? "")
  const choices = data.categories.filter(item => item.kind === kind)
  const accounts = [...new Set(data.entries.map(item => item.account))].slice(0, 40)
  return <RecordForm title={row ? "Edit transaction" : "New entry"} close={close} label={row ? "Save changes" : `Save ${kind}`}
    save={async read => {
      if (!category) throw new Error("Choose a category.")
      const entry = { id: row?.id ?? crypto.randomUUID(), kind, name: read("name"), amount: amountFromText(read("amount")), date: read("date"), category, account: read("account"), notes: read("notes") }
      await commit(current => {
        if (current.preferences.currency !== data.preferences.currency) throw new Error("The ledger currency changed. Reopen this form.")
        if (row && !current.entries.some(item => item.id === row.id)) throw new Error("This transaction was removed in another tab.")
        return { ...current, entries: upsert(current.entries, entry) }
      }, row ? "Transaction updated" : kind === "income" ? "Income saved" : "Expense saved")
    }}>
    <Tabs className="gap-4" value={kind} onValueChange={value => { setKind(value as Kind); setCategory("") }}>
      <TabsList aria-label="Transaction type" className="grid w-full grid-cols-2">
        <TabsTrigger value="expense" className="text-muted-foreground">Expense</TabsTrigger>
        <TabsTrigger value="income" className="text-muted-foreground">Income</TabsTrigger>
      </TabsList>
      <TabsContent value={kind} className="grid gap-4" tabIndex={-1}>
        <Amount amount={row?.amount} currency={data.preferences.currency} />
        <Field name="name" label={kind === "expense" ? "Merchant or description" : "Income description"} required maxLength={120} defaultValue={row?.name} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Choose label="Category" value={category} placeholder="Choose category" options={choices.map(item => [item.id, item.name])} onChange={setCategory} />
          <Field name="account" label="Account" required maxLength={70} list="known-accounts" defaultValue={row?.account ?? "Cash"} />
          <datalist id="known-accounts">{accounts.map(account => <option key={account} value={account} />)}</datalist>
        </div>
        <Field name="date" label="Date" type="date" required defaultValue={row?.date ?? today()} />
        <Field name="notes" label="Notes (optional)" maxLength={500} defaultValue={row?.notes} />
        <details className="rounded-md border px-3 text-sm text-muted-foreground">
          <summary className="flex min-h-11 items-center font-medium text-primary">Privacy &amp; storage</summary>
          <p className="pb-3">Entries are stored in your current browser. Clearing site data can erase them. Download a backup from Settings → Data &amp; backup.</p>
        </details>
        {!choices.length && <p className="text-sm text-muted-foreground">Create a category first under Settings → Categories.</p>}
      </TabsContent>
      <TabsContent value={kind === "expense" ? "income" : "expense"} forceMount hidden />
    </Tabs>
  </RecordForm>
}

export function BudgetForm({ data, row, close, commit }: Shared & { row?: Budget }) {
  const [category, setCategory] = useState(row?.category ?? "")
  return <RecordForm title={row ? "Edit budget" : "New budget"} description="Set a recurring monthly limit for one expense category." close={close} label={row ? "Save changes" : "Create budget"}
    save={async read => {
      if (!category) throw new Error("Choose an expense category.")
      await commit(current => {
        if (current.preferences.currency !== data.preferences.currency) throw new Error("The ledger currency changed. Reopen this form.")
        if (row && !current.budgets.some(item => item.id === row.id)) throw new Error("This budget was removed in another tab.")
        return { ...current, budgets: upsert(current.budgets, { id: row?.id ?? crypto.randomUUID(), category, amount: amountFromText(read("amount")) }) }
      }, row ? "Budget updated" : "Budget created")
    }}>
    <Choose label="Category" value={category} onChange={setCategory} placeholder="Choose category"
      options={data.categories.filter(item => item.kind === "expense").map(item => [item.id, item.name])} />
    <Amount currency={data.preferences.currency} amount={row?.amount} label="Monthly limit" />
  </RecordForm>
}

export function GoalForm({ data, row, close, commit }: Shared & { row?: Goal }) {
  return <RecordForm title={row ? "Edit goal" : "New goal"} close={close} label={row ? "Save changes" : "Create goal"}
    save={async read => {
      await commit(current => {
        if (current.preferences.currency !== data.preferences.currency) throw new Error("The ledger currency changed. Reopen this form.")
        if (row && !current.goals.some(item => item.id === row.id)) throw new Error("This goal was removed in another tab.")
        return { ...current, goals: upsert(current.goals, { id: row?.id ?? crypto.randomUUID(), name: read("name"), amount: amountFromText(read("amount")), date: read("date"), notes: read("notes") }) }
      }, row ? "Goal updated" : "Goal created")
    }}>
    <Field name="name" label="Goal name" maxLength={90} required defaultValue={row?.name} />
    <Amount label="Target amount" currency={data.preferences.currency} amount={row?.amount} />
    <Field name="date" label="Target date (optional)" type="date" defaultValue={row?.date} />
    <Field name="notes" label="Notes (optional)" maxLength={500} defaultValue={row?.notes} />
  </RecordForm>
}

export function ContributionForm({ data, row, goal, close, commit }: Shared & { row?: Contribution; goal?: Goal }) {
  const [goalId, setGoal] = useState(row?.goal ?? goal?.id ?? data.goals[0]?.id ?? "")
  return <RecordForm title={row ? "Edit contribution" : "Add contribution"} close={close} label={row ? "Save changes" : "Add contribution"}
    save={async read => {
      if (!goalId) throw new Error("Choose a savings goal.")
      await commit(current => {
        if (current.preferences.currency !== data.preferences.currency) throw new Error("The ledger currency changed. Reopen this form.")
        if (row && !current.contributions.some(item => item.id === row.id)) throw new Error("This contribution was removed in another tab.")
        return { ...current, contributions: upsert(current.contributions, { id: row?.id ?? crypto.randomUUID(), goal: goalId, amount: amountFromText(read("amount")), date: read("date"), notes: read("notes") }) }
      }, row ? "Contribution updated" : "Contribution added")
    }}>
    <Choose label="Goal" value={goalId} onChange={setGoal} options={data.goals.map(item => [item.id, item.name])} />
    <Amount currency={data.preferences.currency} amount={row?.amount} />
    <Field name="date" label="Date" type="date" required defaultValue={row?.date ?? today()} />
    <Field name="notes" label="Notes (optional)" maxLength={500} defaultValue={row?.notes} />
  </RecordForm>
}

export function CategoryForm({ row, initialKind, close, commit }: Shared & { row?: Category; initialKind: Kind }) {
  const [kind, setKind] = useState(row?.kind ?? initialKind)
  const [colour, setColour] = useState(row?.colour ?? "green")
  const [icon, setIcon] = useState(row?.icon ?? "wallet")
  return <RecordForm title={row ? "Edit category" : "New category"} close={close} label={row ? "Save changes" : "Add category"}
    save={async read => {
      const category = { id: row?.id ?? crypto.randomUUID(), name: read("name"), kind, colour, icon }
      await commit(current => {
        if (row && !current.categories.some(item => item.id === row.id)) throw new Error("This category was removed in another tab.")
        return { ...current, categories: upsert(current.categories, category) }
      }, row ? "Category updated" : "Category added")
    }}>
    {!row && <Choose label="Type" value={kind} options={kindOptions} onChange={value => setKind(value as Kind)} />}
    <Field name="name" label="Name" required maxLength={70} defaultValue={row?.name} />
    <div className="grid grid-cols-2 gap-3">
      <Choose label="Colour" value={colour} options={options(colours)} onChange={value => setColour(value as Category["colour"])} />
      <Choose label="Icon" value={icon} options={options(icons)} onChange={value => setIcon(value as Category["icon"])} />
    </div>
    <div className="flex items-center gap-2 text-sm text-muted-foreground"><CategoryIcon category={{ id: "", name: "", kind, colour, icon }} /> Style preview</div>
  </RecordForm>
}
