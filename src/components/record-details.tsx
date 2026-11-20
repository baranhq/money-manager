"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Choose, ErrorText, FormActions, Menu, Meter, Modal, useOperation, type Commit } from "@/components/shared"
import { contributionDelta, dateLabel, goalSaved, money, spending, type Budget, type Category, type Contribution, type ContributionDirection, type Data, type Entry, type Goal } from "@/lib/finance"

function Details({ rows }: { rows: [string, string][] }) {
  return <dl className="divide-y rounded-lg border px-3">
    {rows.map(([label, value]) => <div key={label} className="grid grid-cols-[minmax(6rem,1fr)_2fr] gap-3 py-2 text-sm">
      <dt className="text-muted-foreground">{label}</dt><dd className="break-words text-right font-medium tabular-nums">{value}</dd>
    </div>)}
  </dl>
}

export function EntryDetail({ row, data, close, edit, remove }: {
  row: Entry; data: Data; close: () => void; edit: () => void; remove: () => void
}) {
  return <Modal title={row.name} description={row.kind === "expense" ? "Expense details" : "Income details"} close={close}>
    <Details rows={[
      ["Amount", money(row.kind === "expense" ? -row.amount : row.amount, data.preferences.currency)],
      ["Date", dateLabel(row.date)], ["Category", data.categories.find(item => item.id === row.category)?.name ?? ""],
      ["Account", row.account], ...(row.notes ? [["Notes", row.notes] as [string, string]] : []),
    ]} />
    <div className="flex justify-end gap-2"><Button variant="outline" onClick={remove}>Delete</Button><Button onClick={edit}>Edit transaction</Button></div>
  </Modal>
}

export function BudgetDetail({ row, data, month, close, edit, remove }: {
  row: Budget; data: Data; month: string; close: () => void; edit: () => void; remove: () => void
}) {
  const spent = spending(data, month).get(row.category) ?? 0
  const currency = data.preferences.currency
  return <Modal title={data.categories.find(item => item.id === row.category)?.name ?? "Budget"} description="Spending for the selected reporting month." close={close}>
    <Details rows={[["Monthly limit", money(row.amount, currency)], ["Spent", money(spent, currency)],
      [spent > row.amount ? "Over limit" : "Remaining", money(Math.abs(row.amount - spent), currency)]]} />
    <div className="text-primary"><Meter label="Budget used" amount={spent} target={row.amount} /></div>
    <div className="flex justify-end gap-2"><Button variant="outline" onClick={remove}>Remove</Button><Button onClick={edit}>Edit budget</Button></div>
  </Modal>
}

export function GoalDetail({ row, data, close, edit, remove, contribute, editContribution, removeContribution }: {
  row: Goal; data: Data; close: () => void; edit: () => void; remove: () => void; contribute: (direction: ContributionDirection) => void
  editContribution: (row: Contribution) => void; removeContribution: (row: Contribution) => void
}) {
  const total = goalSaved(data, row.id)
  const currency = data.preferences.currency
  const contributions = data.contributions.filter(item => item.goal === row.id).sort((a, b) => b.date.localeCompare(a.date))
  return <Modal title={row.name} description={row.date ? `Savings pot · target ${dateLabel(row.date)}` : "Savings pot · no target date"} close={close}>
    <Details rows={[["Current balance", money(total, currency)], ...(row.amount !== null ? [["Target amount", money(row.amount, currency)] as [string, string]] : []), ...(row.notes ? [["Notes", row.notes] as [string, string]] : [])]} />
    {row.amount !== null && <div className="text-primary"><Meter label="Savings pot target progress" amount={total} target={row.amount} /></div>}
    <div className="flex items-center justify-between gap-2"><h3 className="font-semibold">Transfer history</h3>
      <Menu label="Savings pot actions" actions={[{ label: "Edit pot", run: edit }, { label: "Delete pot", run: remove, destructive: true }]} />
    </div>
    {contributions.length ? <ul className="max-h-56 divide-y overflow-auto rounded-lg border">
      {contributions.map(item => <li className="flex items-center justify-between gap-2 px-3 py-1.5 text-sm" key={item.id}>
        <div className="min-w-0"><p className="font-medium tabular-nums">{contributionDelta(item) > 0 ? "+" : "−"}{money(item.amount, currency)} · {item.direction === "deposit" ? "Added" : "Taken out"}</p>
          <p className="break-words text-xs text-muted-foreground">{dateLabel(item.date)}{item.notes && ` · ${item.notes}`}</p></div>
        <Menu label={`Transfer on ${dateLabel(item.date)}`} actions={[
          { label: "Edit transfer", run: () => editContribution(item) }, { label: "Remove transfer", run: () => removeContribution(item), destructive: true },
        ]} /></li>)}
    </ul> : <p className="text-sm text-muted-foreground">No transfers yet.</p>}
    <div className="flex justify-end gap-2">
      <Button variant="outline" disabled={total === 0} onClick={() => contribute("withdrawal")}>Take out</Button>
      <Button onClick={() => contribute("deposit")}><Plus /> Add money</Button>
    </div>
  </Modal>
}

export type Removal = { type: "entry"; row: Entry } | { type: "budget"; row: Budget } |
  { type: "goal"; row: Goal } | { type: "contribution"; row: Contribution } | { type: "category"; row: Category }

export function RemoveRecord({ target, data, close, commit }: { target: Removal; data: Data; close: () => void; commit: Commit }) {
  const operation = useOperation(close)
  const [replacement, setReplacement] = useState("")
  const category = target.type === "category" ? target.row : undefined
  const budget = category && data.budgets.find(item => item.category === category.id)
  const usage = category ? data.entries.filter(item => item.category === category.id).length : 0
  const choices = category ? data.categories.filter(item => item.id !== category.id && item.kind === category.kind) : []
  const id = target.row.id
  const label = { entry: "transaction", budget: "budget", goal: "savings pot", contribution: "transfer", category: "category" }[target.type]
  const affected = target.type === "goal" ? data.contributions.filter(item => item.goal === id).length : 0
  const categoryUse = budget ? "Remove the budget for this category before deleting it." :
    usage ? `This category is used by ${usage} transaction${usage === 1 ? "" : "s"}. Choose where to move them first.` : ""
  const description = categoryUse || (target.type === "goal" && affected
    ? `This also removes ${affected} transfer${affected === 1 ? "" : "s"} from the pot.`
    : `The ${label} will be removed from this device.`)
  const name = "name" in target.row ? target.row.name : undefined
  return <Modal title={`Delete ${label}?`} description={description} close={close} busy={operation.busy} initialFocus="cancel-operation" destructive>
    <form className="grid gap-4" onSubmit={event => {
      event.preventDefault()
      void operation.run(() => commit(current => {
        if (target.type === "entry") return { ...current, entries: current.entries.filter(item => item.id !== id) }
        if (target.type === "budget") return { ...current, budgets: current.budgets.filter(item => item.id !== id) }
        if (target.type === "contribution") return { ...current, contributions: current.contributions.filter(item => item.id !== id) }
        if (target.type === "goal") {
          if (current.contributions.filter(item => item.goal === id).length !== affected) throw new Error("This pot’s transfers changed. Reopen the confirmation to review them.")
          return { ...current, goals: current.goals.filter(item => item.id !== id), contributions: current.contributions.filter(item => item.goal !== id) }
        }
        if (current.budgets.some(item => item.category === id)) throw new Error("Remove this category’s budget first.")
        if (current.entries.filter(item => item.category === id).length !== usage) throw new Error("Category usage changed. Reopen this confirmation to review it.")
        if (usage && !current.categories.some(item => item.id === replacement && item.id !== id && item.kind === target.row.kind)) {
          throw new Error("Choose a replacement category of the same type.")
        }
        return {
          ...current, entries: current.entries.map(item => item.category === id ? { ...item, category: replacement } : item),
          categories: current.categories.filter(item => item.id !== id),
        }
      }, `${label[0].toUpperCase() + label.slice(1)} removed`))
    }}>
      {name && <p className="break-words text-sm font-medium">{name}</p>}
      {usage > 0 && !budget && <Choose label="Move transactions to" value={replacement} onChange={setReplacement}
        placeholder="Choose category" options={choices.map(item => [item.id, item.name])} />}
      {usage > 0 && !budget && !choices.length && <p className="text-sm text-muted-foreground">Add another category of this type first.</p>}
      <ErrorText message={operation.error} />
      <FormActions label={usage && category ? "Reassign and delete" : "Delete"} busy={operation.busy} cancel={close} destructive disabled={Boolean(budget || (usage && !replacement))} />
    </form>
  </Modal>
}
