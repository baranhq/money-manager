"use client"

import { useState, type ReactNode } from "react"
import { ArrowDownRight, ArrowUpRight, ChevronRight, Info, Plus, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CategoryIcon, Empty, EntryCaption, Menu, Meter, Metric, Signed } from "@/components/shared"
import { cn } from "@/lib/utils"
import { dateLabel, goalSaved, money, monthName, monthTotals, percent, shiftMonth, spending, today, type Budget, type Data, type Entry, type Goal } from "@/lib/finance"

type Report = { data: Data; month: string }
export type EditBudget = (budget?: Budget) => void
export type EditGoal = (goal?: Goal) => void

function SectionHeading({ title, note, action }: { title: string; note?: string; action?: ReactNode }) {
  return <div className="mb-3 flex items-start justify-between gap-2">
    <div><h2 className="text-lg leading-tight font-semibold tracking-tight sm:text-xl">{title}</h2>
      {note && <p className="mt-1 text-sm text-muted-foreground">{note}</p>}</div>
    {action}
  </div>
}

export function ViewLink({ href, children }: { href: string; children: ReactNode }) {
  return <Button variant="ghost" size="sm" className="-mr-1 shrink-0 text-primary max-sm:min-h-11" asChild>
    <a href={href}>{children}<ChevronRight size={15} /></a>
  </Button>
}

function Change({ current, previous, currency }: { current: number; previous: number; currency: Data["preferences"]["currency"] }) {
  const difference = current - previous
  return difference === 0 ? "No change from last month" : `${money(Math.abs(difference), currency)} ${difference > 0 ? "more" : "less"} than last month`
}

function Chart({ data, month, savings = false }: Report & { savings?: boolean }) {
  const [selected, setSelected] = useState<string>()
  const rows = Array.from({ length: 5 }, (_, i) => {
    const period = shiftMonth(month, i - 4)
    return { period, ...monthTotals(data, period) }
  })
  const inspected = rows.find(row => row.period === selected) ?? rows[4]
  const currency = data.preferences.currency
  const ceiling = Math.max(1, ...rows.flatMap(row => savings ? [row.saved] : [row.income, row.spent]))
  const axis = [ceiling, Math.round(ceiling / 2), 0]
  const formatAxis = new Intl.NumberFormat("en-IE", {
    style: "currency", currency, notation: "compact", maximumFractionDigits: 1,
  })
  const label = (period: string) => dateLabel(period + "-01", { month: "short" })
  return <Card className="gap-0 p-3 shadow-none sm:p-5">
    <SectionHeading title={savings ? "Monthly contributions" : "Cash flow"} note={savings ? "Money added to all goals" : undefined} action={
      <div className="flex items-center gap-1.5">
        <span className="text-right text-xs font-medium text-primary sm:text-sm">
          {savings ? money(rows[4].saved, currency) : `${money(rows[4].balance, currency)} net`}
        </span>
        <Popover>
          <PopoverTrigger asChild><Button size="icon-sm" variant="secondary" aria-label={savings ? "Contribution chart details" : "Cash flow details"}><Info /></Button></PopoverTrigger>
          <PopoverContent align="end" className="w-64">
            <p className="mb-2 font-medium">{monthName(inspected.period)}</p>
            <dl className="grid grid-cols-[1fr_auto] gap-2 text-sm tabular-nums">
              {savings ? <><dt>Contributions</dt><dd>{money(inspected.saved, currency)}</dd></> :
                <><dt>Income</dt><dd>{money(inspected.income, currency)}</dd><dt>Spent</dt><dd>{money(inspected.spent, currency)}</dd><dt>Net</dt><dd>{money(inspected.balance, currency)}</dd></>}
            </dl>
          </PopoverContent>
        </Popover>
      </div>
    } />
    <div className="mb-3 flex gap-5 text-xs text-muted-foreground">
      <span className="flex items-center gap-1.5"><span className="size-2 rounded-xs bg-chart-1" />{savings ? "Contributions" : "Income"}</span>
      {!savings && <span className="flex items-center gap-1.5"><span className="size-2 rounded-xs bg-chart-2" />Spent</span>}
    </div>
    <div className="relative grid grid-cols-[auto_1fr] gap-2 pb-5">
      <div className="flex h-20 flex-col justify-between text-[0.68rem] text-muted-foreground tabular-nums sm:h-44">
        {axis.map((amount, index) => <span key={index}>{formatAxis.format(amount / 100)}</span>)}
      </div>
      <div className="relative grid h-20 grid-cols-5 gap-1 sm:h-44 sm:gap-4">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex flex-col justify-between">
          <span className="border-t" /><span className="border-t" /><span className="border-t" />
        </div>
        {rows.map(row => <button key={row.period} type="button" aria-pressed={inspected.period === row.period}
          aria-label={`${label(row.period)} ${row.period.slice(0, 4)}. ${savings ? `Contributions ${money(row.saved, currency)}` : `Income ${money(row.income, currency)}, spent ${money(row.spent, currency)}`}`}
          onClick={() => setSelected(row.period)}
          className={cn("relative flex h-full items-end justify-center gap-1 rounded-sm px-1 hover:bg-muted/80 sm:gap-1.5", inspected.period === row.period && "bg-accent/65")}>
          <span className="w-2/5 max-w-6 rounded-t-xs bg-chart-1" style={{ height: `${100 * (savings ? row.saved : row.income) / ceiling}%` }} />
          {!savings && <span className="w-2/5 max-w-6 rounded-t-xs bg-chart-2" style={{ height: `${100 * row.spent / ceiling}%` }} />}
          <span className="absolute -bottom-5 text-xs text-muted-foreground">{label(row.period)}</span>
        </button>)}
      </div>
    </div>
    <p aria-live="polite" className={selected ? "mt-2 text-xs text-muted-foreground" : "sr-only"}>
      {selected && `${label(inspected.period)} · ${savings ? money(inspected.saved, currency) : `Income ${money(inspected.income, currency)} · Spent ${money(inspected.spent, currency)}`}`}
    </p>
  </Card>
}

function BudgetRows({ data, month, items, open, edit, remove }: Report & {
  items: Budget[]; open: (row: Budget) => void; edit?: (row: Budget) => void; remove?: (row: Budget) => void
}) {
  const totals = spending(data, month)
  const currency = data.preferences.currency
  return <div className="divide-y border-y">
    {items.map(row => {
      const used = totals.get(row.category) ?? 0
      const category = data.categories.find(item => item.id === row.category)
      return <div className="flex items-center gap-1" key={row.id}>
        <button type="button" onClick={() => open(row)} className="grid min-h-14 flex-1 grid-cols-[minmax(0,1fr)_minmax(3rem,1fr)_auto] items-center gap-2 py-2 text-left text-sm hover:bg-accent/55 sm:gap-3">
          <span className="flex min-w-0 items-center gap-2"><CategoryIcon category={category} />
            <span className="min-w-0"><span className="block truncate font-medium">{category?.name}</span>
              <span className={cn("block text-xs text-muted-foreground", used > row.amount && "text-destructive")}>
                {money(Math.abs(row.amount - used), currency)} {used > row.amount ? "over" : "left"}</span></span></span>
          <span className="text-primary"><Meter amount={used} target={row.amount} label={`${category?.name} budget used`} /></span>
          <span className="text-right font-medium tabular-nums">{money(used, currency)} / {money(row.amount, currency)}<span className="block text-xs font-normal text-muted-foreground">{percent(used, row.amount)}% used</span></span>
        </button>
        {edit && remove && <Menu label={`Actions for ${category?.name} budget`} actions={[
          { label: "View budget", run: () => open(row) }, { label: "Edit budget", run: () => edit(row) },
          { label: "Remove budget", run: () => remove(row), destructive: true },
        ]} />}
      </div>
    })}
  </div>
}

function GoalHighlight({ data, month, goal, open, create }: Report & { goal?: Goal; open: (goal: Goal) => void; create: () => void }) {
  const saved = goal ? goalSaved(data, goal.id, month) : 0
  const currency = data.preferences.currency
  return <Card className="justify-between gap-4 border-0 bg-accent/70 p-4 shadow-none sm:p-5">
    <div className="flex items-center justify-between gap-2">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-primary"><Target size={17} /> Savings goal</h2>
      {goal && <Button variant="ghost" size="sm" className="-mr-1 text-primary" onClick={() => open(goal)}>View goal<ChevronRight /></Button>}
    </div>
    {goal ? <>
      <h3 className="break-words text-xl font-semibold tracking-tight sm:text-2xl">{goal.name}</h3>
      <div><p className="text-3xl font-semibold tracking-tight tabular-nums sm:text-4xl">{money(saved, currency)}</p>
        <p className="mt-1 text-sm text-muted-foreground">of {money(goal.amount, currency)} saved</p></div>
      <div className="space-y-2 text-primary"><Meter amount={saved} target={goal.amount} label="Goal progress" />
        <p className="flex justify-between text-sm font-medium"><span>{money(Math.max(0, goal.amount - saved), currency)} to go</span><span>{percent(saved, goal.amount)}%</span></p></div>
      {goal.date && <p className="text-xs text-muted-foreground">Target {dateLabel(goal.date)}</p>}
    </> : <div className="space-y-3"><p className="text-sm text-muted-foreground">Set a target and track your contributions.</p>
      <Button variant="outline" size="sm" onClick={create}><Plus /> New goal</Button></div>}
  </Card>
}

export function Overview({ data, month, add, entryDetail, budgetDetail, goalDetail, editGoal, editBudget }: Report & {
  add: () => void; entryDetail: (entry: Entry) => void; budgetDetail: (budget: Budget) => void
  goalDetail: (goal: Goal) => void; editGoal: EditGoal; editBudget: EditBudget
}) {
  const current = monthTotals(data, month)
  const previous = monthTotals(data, shiftMonth(month, -1))
  const used = percent(current.spent, current.income)
  const currency = data.preferences.currency
  const recent = data.entries.filter(row => row.date.startsWith(month)).reverse().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4)

  return <div className="grid gap-5 sm:gap-6 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
    <div className="grid gap-4 md:col-span-2 md:grid-cols-[minmax(0,2fr)_minmax(0,3.2fr)] md:items-center md:gap-5">
      <Card className="gap-2.5 rounded-[14px] border-0 bg-balance px-4 py-3 text-balance-foreground shadow-md sm:gap-3 sm:p-5">
        <div>
          <h2 className="text-sm font-medium">Available to spend</h2>
          <p className="mt-1 break-words text-[clamp(2rem,10vw,2.45rem)] leading-none font-semibold tracking-[-0.04em] tabular-nums sm:text-[clamp(2.4rem,3.55vw,3.2rem)]">{money(current.balance, currency)}</p>
          <p className="mt-1 text-xs opacity-85">Income less spending · {monthName(month, true)}</p>
        </div>
        <div className="space-y-1 text-xs">
          <p><strong>{current.income > 0 ? `${used}%` : "—"}</strong> <span className="ml-1 opacity-90">of monthly income spent</span></p>
          <Meter amount={current.spent} target={current.income} label="Monthly income spent" />
        </div>
      </Card>
      <div className="md:border-l md:pl-4">
        <h2 className="mb-4 hidden text-base font-semibold md:block">This month</h2>
        <div className="grid grid-cols-3 divide-x">
          <Metric label="Income" value={money(current.income, currency)} direction="up" detail={Change({ current: current.income, previous: previous.income, currency })} />
          <Metric label="Spent" value={money(current.spent, currency)} direction="down" detail={Change({ current: current.spent, previous: previous.spent, currency })} />
          <Metric label="Saved" value={money(current.saved, currency)} detail="Contributions this month" />
        </div>
      </div>
    </div>
    <div className="order-2 md:order-0"><Chart data={data} month={month} /></div>
    <div className="order-4 grid md:order-0"><GoalHighlight data={data} month={month} goal={data.goals[0]} open={goalDetail} create={editGoal} /></div>
    <section className="order-3 md:order-0">
      <SectionHeading title="Budgets" note="Spending against monthly limits" action={<ViewLink href="#budgets">View all</ViewLink>} />
      {data.budgets.length ? <BudgetRows data={data} month={month} items={data.budgets.slice(0, 4)} open={budgetDetail} />
        : <Empty title="No budgets yet" action={<Button size="sm" variant="outline" onClick={() => editBudget()}>New budget</Button>}>Set a monthly limit for an expense category.</Empty>}
    </section>
    <section className="order-1 md:order-0">
      <SectionHeading title="Recent activity" action={<ViewLink href="#activity">View all</ViewLink>} />
      {recent.length ? <div className="divide-y border-y">{recent.map((row, i) =>
        <button type="button" key={row.id} className={cn("flex min-h-11 w-full items-center justify-between gap-2 text-sm hover:bg-accent/55 md:min-h-14", i > 1 && "max-md:hidden")}
          onClick={() => entryDetail(row)}>
          <EntryCaption entry={row} category={data.categories.find(category => category.id === row.category)} showDate /><Signed entry={row} currency={currency} />
        </button>)}</div>
        : <Empty title="No activity this month" action={<Button size="sm" variant="outline" onClick={add}>Add transaction</Button>}>Add an expense or income to start your ledger.</Empty>}
    </section>
  </div>
}

export function Budgets({ data, month, edit, open, remove }: Report & {
  edit: EditBudget; open: (row: Budget) => void; remove: (row: Budget) => void
}) {
  const [all, setAll] = useState(false)
  const totals = spending(data, month)
  const currency = data.preferences.currency
  const planned = data.budgets.reduce((sum, row) => sum + row.amount, 0)
  const used = data.budgets.reduce((sum, row) => sum + (totals.get(row.category) ?? 0), 0)
  const breakdown = [...totals.entries()].sort((a, b) => b[1] - a[1])
  const spent = [...totals.values()].reduce((sum, value) => sum + value, 0)
  const now = today()
  const elapsed = month < now.slice(0, 7) ? 100 : month > now.slice(0, 7) ? 0 :
    percent(Number(now.slice(-2)), new Date(Date.parse(shiftMonth(month, 1) + "-01") - 86400000).getUTCDate())
  const items = all ? data.budgets : data.budgets.slice(0, 4)
  return <div className="grid gap-5 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
    <Card className="gap-2 bg-balance p-5 text-balance-foreground md:col-span-1">
      <h2 className="text-sm font-medium">{used > planned ? "Over budget this month" : "Remaining this month"}</h2>
      <p className="break-words text-4xl font-semibold tracking-tight tabular-nums">{money(Math.abs(planned - used), currency)}</p>
      <p className="text-sm">{money(used, currency)} spent · {money(planned, currency)} planned</p>
    </Card>
    <Card className="justify-center gap-3 p-5 shadow-none">
      <h2 className="font-semibold">Spending pace</h2>
      <p className="text-sm text-muted-foreground">{percent(used, planned)}% of plan used · {elapsed}% of month elapsed</p>
      <div className="text-primary"><Meter amount={used} target={planned} label="Budget plan used" /></div>
    </Card>
    <section>
      <SectionHeading title="Category budgets" note="Spent against monthly limits" action={data.budgets.length > 4 && <Button size="sm" variant="ghost" onClick={() => setAll(!all)}>{all ? "Show fewer" : "View all"}</Button>} />
      {items.length ? <><BudgetRows data={data} month={month} items={items} open={open} edit={edit} remove={remove} />
        <Button variant="outline" className="mt-4" onClick={() => edit()}><Plus /> New budget</Button></> :
        <Empty title="No category budgets" action={<Button variant="outline" onClick={() => edit()}><Plus /> New budget</Button>}>Choose an expense category to set your first limit.</Empty>}
    </section>
    <div className="grid content-start gap-4">
      <Card className="gap-3 p-5 shadow-none"><SectionHeading title="Spending by category" note={`${money(spent, currency)} across ${breakdown.length} categories`} />
        {breakdown.length ? <ul className="space-y-3">{breakdown.map(([id, amount]) => <li key={id} className="space-y-1">
          <p className="flex justify-between gap-2 text-sm"><span>{data.categories.find(row => row.id === id)?.name}</span><span className="shrink-0 tabular-nums">{percent(amount, spent)}% · {money(amount, currency)}</span></p>
          <div className="text-primary"><Meter amount={amount} target={spent} label="Share of monthly spending" /></div>
        </li>)}</ul> : <p className="text-sm text-muted-foreground">No expenses this month.</p>}
      </Card>
      <Card className="gap-2 bg-accent/65 p-5 shadow-none">
        <SectionHeading title="Savings goals" action={<ViewLink href="#savings">View savings</ViewLink>} />
        <p className="text-sm text-muted-foreground">{data.goals.length} {data.goals.length === 1 ? "goal" : "goals"}</p>
      </Card>
    </div>
  </div>
}

export function Savings({ data, month, open, edit, contribute, remove }: Report & {
  open: (goal: Goal) => void; edit: EditGoal; contribute: (goal?: Goal) => void; remove: (goal: Goal) => void
}) {
  const savedByGoal = new Map<string, number>()
  let total = 0
  for (const contribution of data.contributions) {
    if (contribution.date.slice(0, 7) <= month) {
      savedByGoal.set(contribution.goal, (savedByGoal.get(contribution.goal) ?? 0) + contribution.amount)
      total += contribution.amount
    }
  }
  const target = data.goals.reduce((sum, row) => sum + row.amount, 0)
  const currency = data.preferences.currency
  return <div className="grid gap-5 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
    <Card className="gap-2 bg-balance p-5 text-balance-foreground">
      <h2 className="text-sm font-medium">Total saved</h2>
      <p className="break-words text-4xl font-semibold tracking-tight tabular-nums">{money(total, currency)}</p>
      <p className="text-sm">Across {data.goals.length} {data.goals.length === 1 ? "goal" : "goals"}</p>
    </Card>
    <Card className="justify-center gap-3 p-5 shadow-none">
      <h2 className="font-semibold">Goal progress</h2>
      <p className="text-sm text-muted-foreground">{percent(total, target)}% of {money(target, currency)} target</p>
      <div className="text-primary"><Meter amount={total} target={target} label="Savings target funded" /></div>
    </Card>
    <section className="order-2 md:order-none">
      <SectionHeading title="Savings goals" action={<Button variant="outline" size="sm" onClick={() => edit()}><Plus /> New goal</Button>} />
      {data.goals.length ? <div className="grid gap-3">{data.goals.map(goal => {
        const saved = savedByGoal.get(goal.id) ?? 0
        return <Card key={goal.id} className="gap-2 p-4 shadow-none">
          <div className="flex items-center justify-between gap-2">
            <button type="button" className="min-h-9 min-w-0 text-left font-semibold hover:underline" onClick={() => open(goal)}>{goal.name}</button>
            <Menu label={`Actions for ${goal.name}`} actions={[
              { label: "View goal", run: () => open(goal) }, { label: "Add contribution", run: () => contribute(goal) },
              { label: "Edit goal", run: () => edit(goal) }, { label: "Delete goal", run: () => remove(goal), destructive: true },
            ]} />
          </div>
          <p className="text-sm text-muted-foreground">{money(saved, currency)} of {money(goal.amount, currency)} · {percent(saved, goal.amount)}%</p>
          <div className="text-primary"><Meter amount={saved} target={goal.amount} label={`Progress for ${goal.name}`} /></div>
          <p className="text-xs text-muted-foreground">{goal.date ? `Target ${dateLabel(goal.date)}` : "Ongoing"}</p>
        </Card>
      })}</div> : <Empty title="No goals yet">Create a goal, then record the money you put aside.</Empty>}
      {data.goals.length > 0 && <Button variant="outline" className="mt-4" onClick={() => contribute()}><Plus /> Add money</Button>}
    </section>
    <div className="order-1 md:order-none"><Chart data={data} month={month} savings /></div>
  </div>
}

export function EntrySignIcon({ income }: { income: boolean }) {
  const Icon = income ? ArrowUpRight : ArrowDownRight
  return <Icon className={income ? "text-primary" : "text-destructive"} aria-hidden="true" />
}
