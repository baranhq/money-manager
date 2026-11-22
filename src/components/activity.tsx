"use client"

import { useMemo, useState } from "react"
import { ListFilter, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DateField } from "@/components/date-field"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Choose, Empty, EntryCaption, Menu, Metric, Modal, Signed } from "@/components/shared"
import { dateLabel, money, monthTotals, today, type Data, type Entry } from "@/lib/finance"

type Filters = { category: string; account: string; kind: string; date: string; start: string; end: string; sort: string }
const defaults: Filters = { category: "all", account: "all", kind: "all", date: "month", start: "", end: "", sort: "newest" }

export function Activity({ data, month, add, open, edit, remove }: {
  data: Data; month: string; add: () => void; open: (entry: Entry) => void; edit: (entry: Entry) => void; remove: (entry: Entry) => void
}) {
  const [query, setQuery] = useState("")
  const [filters, setFilters] = useState(defaults)
  const [showFilters, setShowFilters] = useState(false)
  const [limit, setLimit] = useState(50)
  function set<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters(current => ({ ...current, [key]: value }))
    setLimit(50)
  }
  const categories = useMemo(() => new Map(data.categories.map(category => [category.id, category])), [data.categories])
  const accounts = [...new Set(data.entries.map(entry => entry.account))].sort()
  const totals = monthTotals(data, month)
  const search = query.trim().toLocaleLowerCase()
  const active = search || JSON.stringify(filters) !== JSON.stringify(defaults)
  const source = filters.sort === "oldest" ? data.entries : [...data.entries].reverse()
  const matching = source.filter(row => {
    if (filters.date === "month" && !row.date.startsWith(month)) return false
    if (filters.date === "custom" && ((filters.start && row.date < filters.start) || (filters.end && row.date > filters.end))) return false
    if (filters.category !== "all" && `category:${row.category}` !== filters.category) return false
    if (filters.account !== "all" && `account:${row.account}` !== filters.account) return false
    if (filters.kind !== "all" && row.kind !== filters.kind) return false
    return [row.name, row.account, row.notes, categories.get(row.category)?.name].some(value => value?.toLocaleLowerCase().includes(search))
  }).sort((a, b) => {
    if (filters.sort === "largest") return b.amount - a.amount || b.date.localeCompare(a.date)
    if (filters.sort === "smallest") return a.amount - b.amount || b.date.localeCompare(a.date)
    return filters.sort === "oldest" ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date)
  })
  const rows = matching.slice(0, limit)
  const groupByDate = filters.sort === "oldest" || filters.sort === "newest"

  function groupLabel(date: string) {
    const prefix = date === today() ? "Today · " : ""
    return prefix + dateLabel(date, undefined, data.preferences)
  }

  const dateOptions = [["month", "Selected month"], ["all", "All dates"], ["custom", "Custom range"]] as const
  const categoryOptions: [string, string][] = [["all", "All categories"], ...data.categories.map(row => [`category:${row.id}`, row.name] as [string, string])]
  const accountOptions: [string, string][] = [["all", "All accounts"], ...accounts.map(account => [`account:${account}`, account] as [string, string])]
  const actions = (row: Entry) => [
    { label: "View details", run: () => open(row) },
    { label: "Edit transaction", run: () => edit(row) },
    { label: "Delete transaction", run: () => remove(row), destructive: true },
  ]

  return <div className="space-y-5">
    <div className="grid grid-cols-3 gap-2 divide-x rounded-xl border bg-card p-3 sm:p-5">
      <Metric label="Income" value={money(totals.income, data.preferences)} direction="up" detail="Income in the selected month" />
      <Metric label="Spent" value={money(totals.spent, data.preferences)} direction="down" detail="Expenses in the selected month" />
      <Metric label="Net cash flow" value={money(totals.balance, data.preferences)} detail="Income after spending" />
    </div>
    <div className="grid gap-2 md:grid-cols-[minmax(12rem,2fr)_repeat(3,minmax(0,1fr))_auto]">
      <div className="relative">
        <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
        <Input type="search" aria-label="Search activity" className="bg-card pl-9 max-md:h-11" placeholder="Search merchant or category" value={query} onChange={event => { setQuery(event.target.value); setLimit(50) }} />
      </div>
      <div className="grid grid-cols-2 gap-2 md:contents">
        <Choose compact label="Category" options={categoryOptions} value={filters.category} onChange={value => set("category", value)} />
        <Choose compact label="Account" options={accountOptions} value={filters.account} onChange={value => set("account", value)} />
      </div>
      <div className="hidden md:block"><Choose compact label="Date range" value={filters.date} options={dateOptions} onChange={value => { set("date", value); if (value === "custom") setShowFilters(true) }} /></div>
      <Button variant="outline" className="justify-self-start max-md:min-h-11" onClick={() => setShowFilters(true)}><ListFilter /> Filters</Button>
    </div>
    {active && <div className="flex items-center gap-3 text-sm"><span role="status">{matching.length} matching {matching.length === 1 ? "transaction" : "transactions"}</span>
      <Button variant="ghost" size="sm" onClick={() => { setQuery(""); setFilters(defaults); setLimit(50) }}>Clear filters</Button></div>}
    {!rows.length ? <Empty title={active ? "No matching transactions" : "No transactions this month"} action={!active && <Button onClick={add}>Add transaction</Button>}>
      {active ? "Change your search or clear the filters." : "Add an expense or income to get started."}
    </Empty> : <>
      <ul className="divide-y border-y md:hidden">
        {rows.map((row, index) => <li key={row.id}>
          {groupByDate && rows[index - 1]?.date !== row.date && <h2 className="bg-muted/45 px-2 py-2 text-xs font-medium text-muted-foreground">{groupLabel(row.date)}</h2>}
          <div className="flex items-center">
            <button type="button" className="flex min-h-14 min-w-0 flex-1 items-center justify-between gap-2 py-2 text-sm" onClick={() => open(row)}>
              <EntryCaption entry={row} category={categories.get(row.category)} preferences={data.preferences} showDate={!groupByDate} /><Signed entry={row} preferences={data.preferences} />
            </button>
            <Menu label={`Actions for ${row.name}`} actions={actions(row)} />
          </div>
        </li>)}
      </ul>
      <div className="hidden overflow-hidden rounded-xl border bg-card md:block">
        <Table aria-label="Transactions"><TableHeader><TableRow><TableHead>Description</TableHead><TableHead>Account</TableHead><TableHead className="text-right">Amount</TableHead><TableHead><span className="sr-only">Actions</span></TableHead></TableRow></TableHeader>
          {rows.map((row, index) => <TableBody key={row.id}>
            {groupByDate && rows[index - 1]?.date !== row.date && <TableRow className="bg-muted/45"><TableCell colSpan={4} className="text-xs font-medium text-muted-foreground">{groupLabel(row.date)}</TableCell></TableRow>}
            <TableRow>
              <TableCell className="w-1/2"><button type="button" className="block w-full max-w-[32vw] rounded-sm hover:underline" onClick={() => open(row)}><EntryCaption entry={row} category={categories.get(row.category)} preferences={data.preferences} showDate={!groupByDate} /></button></TableCell>
              <TableCell className="max-w-36 truncate text-muted-foreground">{row.account}</TableCell>
              <TableCell className="text-right"><Signed entry={row} preferences={data.preferences} /></TableCell>
              <TableCell className="w-12 text-right"><Menu label={`Actions for ${row.name}`} actions={actions(row)} /></TableCell>
            </TableRow>
          </TableBody>)}
        </Table>
      </div>
      {matching.length > limit && <Button variant="outline" onClick={() => setLimit(limit + 50)}>Show more transactions</Button>}
    </>}
    {showFilters && <Modal title="Filters" description="Choose which transactions to show." close={() => setShowFilters(false)}>
      <Choose label="Category" options={categoryOptions} value={filters.category} onChange={value => set("category", value)} />
      <Choose label="Account" options={accountOptions} value={filters.account} onChange={value => set("account", value)} />
      <Choose label="Type" options={[["all", "All types"], ["expense", "Expense"], ["income", "Income"]]} value={filters.kind} onChange={value => set("kind", value)} />
      <Choose label="Date range" value={filters.date} options={dateOptions} onChange={value => set("date", value)} />
      {filters.date === "custom" && <div className="grid grid-cols-2 gap-3">
        <DateField label="From" name="start" preferences={data.preferences} value={filters.start} max={filters.end || undefined} onChange={value => set("start", value)} />
        <DateField label="To" name="end" preferences={data.preferences} value={filters.end} min={filters.start || undefined} onChange={value => set("end", value)} />
      </div>}
      <Choose label="Sort by" value={filters.sort} options={[["newest", "Newest first"], ["oldest", "Oldest first"], ["largest", "Highest amount"], ["smallest", "Lowest amount"]]} onChange={value => set("sort", value)} />
      <Button onClick={() => setShowFilters(false)}>Show transactions</Button>
    </Modal>}
  </div>
}
