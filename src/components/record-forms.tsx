"use client"

import { useContext, useState, type FormEvent, type ReactNode } from "react"
import { TourEditorContext } from "@/components/app-tour"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DateField } from "@/components/date-field"
import { CategoryIcon, Choose, ErrorText, Field, FormActions, Modal, formValues, useOperation, type Commit } from "@/components/shared"
import { amountFromText, amountInput, colours, icons, today, upsert, type Budget, type Category, type Contribution, type ContributionDirection, type Data, type Entry, type Goal, type Kind, type Preferences } from "@/lib/finance"

type Shared = { data: Data; close: () => void; commit: Commit }
const local = "Saved in this browser on this device."
const kindOptions = [["expense", "Expense"], ["income", "Income"]] as const
const options = (values: readonly string[]) => values.map(value => [value, value.charAt(0).toUpperCase() + value.slice(1)] as const)

function RecordForm({ title, description = local, close, children, save, label }: {
  title: string; description?: string; close: () => void; children: ReactNode
  save: (values: (name: string) => string) => Promise<unknown>; label: string
}) {
  const operation = useOperation(close)
  const coach = useContext(TourEditorContext)
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
    {!discard && coach?.scope === "record" && coach.panel}
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

function Amount({ preferences, amount, label = "Amount", required = true }: { preferences: Preferences; amount?: number | null; label?: string; required?: boolean }) {
  return <div className="grid gap-2">
    <Field name="amount" label={`${label} (${preferences.currency})${required ? "" : " (optional)"}`} required={required}
      inputMode="decimal" maxLength={32} placeholder={amountInput(0, preferences)} defaultValue={amount ? amountInput(amount, preferences) : ""} />
    <p className="text-xs text-muted-foreground">Enter the amount using {preferences.numberFormat === "regional" ? "your selected locale’s" : "the selected"} decimal separator.</p>
  </div>
}

export function EntryForm({ row, initialKind = "expense", ...props }: Shared & { row?: Entry; initialKind?: Kind }) {
  const { data, close, commit } = props
  const [kind, setKind] = useState<Kind>(row?.kind ?? initialKind)
  const [category, setCategory] = useState(row?.category ?? "")
  const choices = data.categories.filter(item => item.kind === kind)
  const configuredAccounts = data.accounts?.map(account => account.name) ?? []
  const recentAccounts = [...new Set(data.entries.map(item => item.account))].slice(0, 40)
  const accounts = [...new Set([...configuredAccounts, ...recentAccounts])]
  return <RecordForm title={row ? "Edit transaction" : "New entry"} close={close} label={row ? "Save changes" : `Save ${kind}`}
    save={async read => {
      if (!category) throw new Error("Choose a category.")
      const entry = { id: row?.id ?? crypto.randomUUID(), kind, name: read("name"), amount: amountFromText(read("amount"), data.preferences), date: read("date"), category, account: read("account"), notes: read("notes") }
      await commit(current => {
        if (current.preferences.currency !== data.preferences.currency || current.preferences.currencyDigits !== data.preferences.currencyDigits) throw new Error("The ledger currency changed. Reopen this form.")
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
        <Amount amount={row?.amount} preferences={data.preferences} />
        <Field name="name" label={kind === "expense" ? "Merchant or description" : "Income description"} required maxLength={120} defaultValue={row?.name} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Choose label="Category" value={category} placeholder="Choose category" options={choices.map(item => [item.id, item.name])} onChange={setCategory} />
          <Field name="account" label="Account" required maxLength={70} list="known-accounts" defaultValue={row?.account ?? configuredAccounts[0] ?? "Cash"} />
          <datalist id="known-accounts">{accounts.map(account => <option key={account} value={account} />)}</datalist>
        </div>
        <DateField name="date" label="Date" preferences={data.preferences} required defaultValue={row?.date ?? today()} />
        <Field name="notes" label="Notes (optional)" maxLength={500} defaultValue={row?.notes} />
        {!choices.length && <p className="text-sm text-muted-foreground">Create a category first under Settings → Categories.</p>}
      </TabsContent>
      <TabsContent value={kind === "expense" ? "income" : "expense"} forceMount hidden />
    </Tabs>
  </RecordForm>
}

export function BudgetForm({ data, row, close, commit }: Shared & { row?: Budget }) {
  const [category, setCategory] = useState(row?.category ?? "")
  const selectedCategory = data.categories.find(item => item.id === category)
  const namingOther = !row && selectedCategory?.id === "other" && selectedCategory.name.trim() === "Other"
  return <RecordForm title={row ? "Edit budget" : "New budget"} description="Set a recurring monthly limit for one expense category." close={close} label={row ? "Save changes" : "Create budget"}
    save={async read => {
      if (!category) throw new Error("Choose an expense category.")
      const customName = namingOther ? read("otherCategoryName").trim() : ""
      if (namingOther && !customName) throw new Error("Enter a name for this category.")
      const customCategory: Category | undefined = namingOther ? {
        id: crypto.randomUUID(), name: customName, kind: "expense", colour: "grey", icon: "wallet",
      } : undefined
      await commit(current => {
        if (current.preferences.currency !== data.preferences.currency || current.preferences.currencyDigits !== data.preferences.currencyDigits) throw new Error("The ledger currency changed. Reopen this form.")
        if (row && !current.budgets.some(item => item.id === row.id)) throw new Error("This budget was removed in another tab.")
        if (customCategory) {
          const other = current.categories.find(item => item.id === "other" && item.kind === "expense" && item.name.trim() === "Other")
          if (!other) throw new Error("The Other category changed in another tab. Reopen this form.")
          const normalizedName = customCategory.name.normalize("NFKC").toLowerCase()
          if (current.categories.some(item => item.kind === "expense" && item.name.trim().normalize("NFKC").toLowerCase() === normalizedName)) {
            throw new Error("An expense category with this name already exists.")
          }
        }
        const budgetCategory = customCategory?.id ?? category
        return {
          ...current,
          categories: customCategory ? [...current.categories, customCategory] : current.categories,
          budgets: upsert(current.budgets, { id: row?.id ?? crypto.randomUUID(), category: budgetCategory, amount: amountFromText(read("amount"), data.preferences) }),
        }
      }, row ? "Budget updated" : "Budget created")
    }}>
    <Choose label="Category" value={category} onChange={setCategory} placeholder="Choose category"
      options={data.categories.filter(item => item.kind === "expense").map(item => [item.id, item.name])} />
    {namingOther && <Field name="otherCategoryName" label="Category name" placeholder="e.g. Travel" required maxLength={70} />}
    <Amount preferences={data.preferences} amount={row?.amount} label="Monthly limit" />
  </RecordForm>
}

export function GoalForm({ data, row, close, commit }: Shared & { row?: Goal }) {
  return <RecordForm title={row ? "Edit savings pot" : "New savings pot"}
    description="A target is optional. Adding money reduces Available to spend; taking it out adds it back."
    close={close} label={row ? "Save changes" : "Create pot"}
    save={async read => {
      const target = read("amount").trim() ? amountFromText(read("amount"), data.preferences) : null
      await commit(current => {
        if (current.preferences.currency !== data.preferences.currency || current.preferences.currencyDigits !== data.preferences.currencyDigits) throw new Error("The ledger currency changed. Reopen this form.")
        if (row && !current.goals.some(item => item.id === row.id)) throw new Error("This savings pot was removed in another tab.")
        return { ...current, goals: upsert(current.goals, { id: row?.id ?? crypto.randomUUID(), name: read("name"), amount: target, date: read("date"), notes: read("notes") }) }
      }, row ? "Savings pot updated" : "Savings pot created")
    }}>
    <Field name="name" label="Pot name" maxLength={90} required defaultValue={row?.name} />
    <Amount label="Target amount" preferences={data.preferences} amount={row?.amount} required={false} />
    <DateField name="date" label="Target date (optional)" preferences={data.preferences} defaultValue={row?.date} />
    <Field name="notes" label="Notes (optional)" maxLength={500} defaultValue={row?.notes} />
  </RecordForm>
}

export function ContributionForm({ data, row, goal, initialDirection = "deposit", close, commit }: Shared & { row?: Contribution; goal?: Goal; initialDirection?: ContributionDirection }) {
  const [goalId, setGoal] = useState(row?.goal ?? goal?.id ?? data.goals[0]?.id ?? "")
  const [direction, setDirection] = useState<ContributionDirection>(row?.direction ?? initialDirection)
  const transferLabel = direction === "deposit" ? "Add money" : "Take out"
  return <RecordForm title={row ? "Edit transfer" : transferLabel}
    description={row ? "A withdrawal must stay within the pot balance on its date." : "Adding money reduces Available to spend. Taking it out adds it back."}
    close={close} label={row ? "Save changes" : transferLabel}
    save={async read => {
      if (!goalId) throw new Error("Choose a savings pot.")
      await commit(current => {
        if (current.preferences.currency !== data.preferences.currency || current.preferences.currencyDigits !== data.preferences.currencyDigits) throw new Error("The ledger currency changed. Reopen this form.")
        if (row && !current.contributions.some(item => item.id === row.id)) throw new Error("This transfer was removed in another tab.")
        return { ...current, contributions: upsert(current.contributions, { id: row?.id ?? crypto.randomUUID(), goal: goalId, amount: amountFromText(read("amount"), data.preferences), direction, date: read("date"), notes: read("notes") }) }
      }, row ? "Transfer updated" : direction === "deposit" ? "Money added to pot" : "Money taken out of pot")
    }}>
    <Choose label="Transfer type" value={direction} onChange={value => setDirection(value as ContributionDirection)} options={[["deposit", "Add money"], ["withdrawal", "Take money out"]]} />
    <Choose label="Savings pot" value={goalId} onChange={setGoal} options={data.goals.map(item => [item.id, item.name])} />
    <Amount preferences={data.preferences} amount={row?.amount} />
    <DateField name="date" label="Date" preferences={data.preferences} required defaultValue={row?.date ?? today()} />
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
