"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Choose, ErrorText, FormActions, Menu, Meter, Modal, useOperation, type Commit } from "@/components/shared"
import { assertRecordSetUnchanged, contributionDelta, dateLabel, goalSaved, money, removeRecordIfUnchanged, spending, type Budget, type Category, type Contribution, type ContributionDirection, type Data, type Entry, type Goal } from "@/lib/finance"

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
      ["Amount", money(row.kind === "expense" ? -row.amount : row.amount, data.preferences)],
      ["Date", dateLabel(row.date, undefined, data.preferences)], ["Category", data.categories.find(item => item.id === row.category)?.name ?? ""],
      ["Account", row.account], ...(row.notes ? [["Notes", row.notes] as [string, string]] : []),
    ]} />
    <div className="flex justify-end gap-2"><Button variant="outline" onClick={remove}>Delete</Button><Button onClick={edit}>Edit transaction</Button></div>
  </Modal>
}

export function BudgetDetail({ row, data, month, close, edit, remove }: {
  row: Budget; data: Data; month: string; close: () => void; edit: () => void; remove: () => void
}) {
  const spent = spending(data, month).get(row.category) ?? 0n
  const preferences = data.preferences
  const difference = BigInt(row.amount) - spent
  return <Modal title={data.categories.find(item => item.id === row.category)?.name ?? "Budget"} description="Spending for the selected reporting month." close={close}>
    <Details rows={[["Monthly limit", money(row.amount, preferences)], ["Spent", money(spent, preferences)],
      [difference < 0n ? "Over limit" : "Remaining", money(difference < 0n ? -difference : difference, preferences)]]} />
    <div className="text-primary"><Meter label="Budget used" amount={spent} target={row.amount} /></div>
    <div className="flex justify-end gap-2"><Button variant="outline" onClick={remove}>Remove</Button><Button onClick={edit}>Edit budget</Button></div>
  </Modal>
}

export function GoalDetail({ row, data, close, edit, remove, contribute, editContribution, removeContribution }: {
  row: Goal; data: Data; close: () => void; edit: () => void; remove: () => void; contribute: (direction: ContributionDirection) => void
  editContribution: (row: Contribution) => void; removeContribution: (row: Contribution) => void
}) {
  const total = goalSaved(data, row.id)
  const preferences = data.preferences
  const contributions = data.contributions.filter(item => item.goal === row.id).sort((a, b) => b.date.localeCompare(a.date))
  return <Modal title={row.name} description={row.date ? `Savings pot · target ${dateLabel(row.date, undefined, preferences)}` : "Savings pot · no target date"} close={close}>
    <Details rows={[["Current balance", money(total, preferences)], ...(row.amount !== null ? [["Target amount", money(row.amount, preferences)] as [string, string]] : []), ...(row.notes ? [["Notes", row.notes] as [string, string]] : [])]} />
    {row.amount !== null && <div className="text-primary"><Meter label="Savings pot target progress" amount={total} target={row.amount} /></div>}
    <div className="flex items-center justify-between gap-2"><h3 className="font-semibold">Transfer history</h3>
      <Menu label="Savings pot actions" actions={[{ label: "Edit pot", run: edit }, { label: "Delete pot", run: remove, destructive: true }]} />
    </div>
    {contributions.length ? <ul className="max-h-56 divide-y overflow-auto rounded-lg border">
      {contributions.map(item => <li className="flex items-center justify-between gap-2 px-3 py-1.5 text-sm" key={item.id}>
        <div className="min-w-0"><p className="font-medium tabular-nums">{contributionDelta(item) > 0n ? "+" : "−"}{money(item.amount, preferences)} · {item.direction === "deposit" ? "Added" : "Taken out"}</p>
          <p className="break-words text-xs text-muted-foreground">{dateLabel(item.date, undefined, preferences)}{item.notes && ` · ${item.notes}`}</p></div>
        <Menu label={`Transfer on ${dateLabel(item.date, undefined, preferences)}`} actions={[
          { label: "Edit transfer", run: () => editContribution(item) }, { label: "Remove transfer", run: () => removeContribution(item), destructive: true },
        ]} /></li>)}
    </ul> : <p className="text-sm text-muted-foreground">No transfers yet.</p>}
    <div className="flex justify-end gap-2">
      <Button variant="outline" disabled={total === 0n} onClick={() => contribute("withdrawal")}>Take out</Button>
      <Button onClick={() => contribute("deposit")}><Plus /> Add money</Button>
    </div>
  </Modal>
}

export type Removal = { type: "entry"; row: Entry } | { type: "budget"; row: Budget } |
  { type: "goal"; row: Goal } | { type: "contribution"; row: Contribution } | { type: "category"; row: Category }

export function RemoveRecord({ target, data, close, commit }: { target: Removal; data: Data; close: () => void; commit: Commit }) {
  const operation = useOperation(close)
  const [replacement, setReplacement] = useState("")
  const [originalTransfers] = useState(() => target.type === "goal" ? data.contributions.filter(item => item.goal === target.row.id) : [])
  const category = target.type === "category" ? target.row : undefined
  const [originalCategoryEntries] = useState(() => target.type === "category" ? data.entries.filter(item => item.category === target.row.id) : [])
  const budget = category && data.budgets.find(item => item.category === category.id)
  const usage = category ? originalCategoryEntries.length : 0
  const choices = category ? data.categories.filter(item => item.id !== category.id && item.kind === category.kind) : []
  const id = target.row.id
  const label = { entry: "transaction", budget: "budget", goal: "savings pot", contribution: "transfer", category: "category" }[target.type]
  const affected = target.type === "goal" ? originalTransfers.length : 0
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
        if (target.type === "entry") return { ...current, entries: removeRecordIfUnchanged(current.entries, target.row, "transaction") }
        if (target.type === "budget") return { ...current, budgets: removeRecordIfUnchanged(current.budgets, target.row, "budget") }
        if (target.type === "contribution") return { ...current, contributions: removeRecordIfUnchanged(current.contributions, target.row, "transfer") }
        if (target.type === "goal") {
          assertRecordSetUnchanged(current.contributions.filter(item => item.goal === id), originalTransfers, "transfer")
          return {
            ...current,
            goals: removeRecordIfUnchanged(current.goals, target.row, "savings pot"),
            contributions: current.contributions.filter(item => item.goal !== id),
          }
        }
        if (current.budgets.some(item => item.category === id)) throw new Error("Remove this category’s budget first.")
        assertRecordSetUnchanged(current.entries.filter(item => item.category === id), originalCategoryEntries, "transaction")
        if (usage && !current.categories.some(item => item.id === replacement && item.id !== id && item.kind === target.row.kind)) {
          throw new Error("Choose a replacement category of the same type.")
        }
        return {
          ...current, entries: current.entries.map(item => item.category === id ? { ...item, category: replacement } : item),
          categories: removeRecordIfUnchanged(current.categories, target.row, "category"),
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
