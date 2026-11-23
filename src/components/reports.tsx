"use client"

import { useState, type ReactNode } from "react"
import { ArrowDownRight, ArrowUpRight, ChevronDown, ChevronRight, Info, Plus, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CategoryIcon, Empty, EntryCaption, Menu, Meter, Metric, Signed } from "@/components/shared"
import { cn } from "@/lib/utils"
import { compactMoney, dateLabel, goalSaved, goalSavedByGoal, money, monthName, monthTotals, percent, savingsMovement, shiftMonth, spending, today, type Budget, type Data, type Entry, type Goal } from "@/lib/finance"

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

function Change({ current, previous, preferences }: { current: bigint; previous: bigint; preferences: Data["preferences"] }) {
  const difference = current - previous
  const amount = difference < 0n ? -difference : difference
  return difference === 0n ? "No change from last month" : `${money(amount, preferences)} ${difference > 0n ? "more" : "less"} than last month`
}

function Chart({ data, month, savings = false }: Report & { savings?: boolean }) {
  const [selected, setSelected] = useState<string>()
  const rows = Array.from({ length: 5 }, (_, i) => {
    const period = shiftMonth(month, i - 4)
    return { period, ...monthTotals(data, period), movement: savingsMovement(data, period) }
  })
  const inspected = rows.find(row => row.period === selected) ?? rows[4]
  const ceiling = Math.max(1, ...rows.flatMap(row => savings
    ? [Number(row.movement.added), Number(row.movement.withdrawn)]
    : [Number(row.income), Number(row.spent)]))
  const axis = [ceiling, Math.round(ceiling / 2), 0]
  const label = (period: string) => dateLabel(period + "-01", { month: "short" }, data.preferences)
  return <Card className="gap-0 p-3 shadow-none sm:p-5">
    <SectionHeading title={savings ? "Money in and out" : "Cash flow"} action={
      <div className="flex items-center gap-1.5">
        <span className="text-right text-xs font-medium text-primary sm:text-sm">
          {savings ? `${money(rows[4].movement.net, data.preferences)} net` : `${money(rows[4].balance, data.preferences)} net`}
        </span>
        <Popover>
          <PopoverTrigger asChild><Button size="icon-sm" variant="secondary" aria-label={savings ? "Savings chart details" : "Cash flow details"}><Info /></Button></PopoverTrigger>
          <PopoverContent align="end" className="w-64">
            <p className="mb-2 font-medium">{monthName(inspected.period, false, data.preferences)}</p>
            <dl className="grid grid-cols-[1fr_auto] gap-2 text-sm tabular-nums">
              {savings ? <><dt>Added</dt><dd>{money(inspected.movement.added, data.preferences)}</dd><dt>Taken out</dt><dd>{money(inspected.movement.withdrawn, data.preferences)}</dd><dt>Net moved to pots</dt><dd>{money(inspected.movement.net, data.preferences)}</dd></> :
                <><dt>Income</dt><dd>{money(inspected.income, data.preferences)}</dd><dt>Spent</dt><dd>{money(inspected.spent, data.preferences)}</dd>
                  <dt>Added to pots</dt><dd>{money(inspected.movement.added, data.preferences)}</dd><dt>Taken out</dt><dd>{money(inspected.movement.withdrawn, data.preferences)}</dd>
                  <dt>Available to spend</dt><dd>{money(inspected.balance, data.preferences)}</dd></>}
            </dl>
          </PopoverContent>
        </Popover>
      </div>
    } />
    <div className="mb-3 flex gap-5 text-xs text-muted-foreground">
      <span className="flex items-center gap-1.5"><span className="size-2 rounded-xs bg-chart-1" />{savings ? "Added" : "Income"}</span>
      <span className="flex items-center gap-1.5"><span className="size-2 rounded-xs bg-chart-2" />{savings ? "Taken out" : "Spent"}</span>
    </div>
    <div className="relative grid grid-cols-[auto_1fr] gap-2 pb-5">
      <div className="flex h-20 flex-col justify-between text-[0.68rem] text-muted-foreground tabular-nums sm:h-44">
        {axis.map((amount, index) => <span key={index}>{compactMoney(amount, data.preferences)}</span>)}
      </div>
      <div className="relative grid h-20 grid-cols-5 gap-1 sm:h-44 sm:gap-4">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex flex-col justify-between">
          <span className="border-t" /><span className="border-t" /><span className="border-t" />
        </div>
        {rows.map(row => <button key={row.period} type="button" aria-pressed={inspected.period === row.period}
          aria-label={`${label(row.period)} ${row.period.slice(0, 4)}. ${savings ? `Added ${money(row.movement.added, data.preferences)}, taken out ${money(row.movement.withdrawn, data.preferences)}` : `Income ${money(row.income, data.preferences)}, spent ${money(row.spent, data.preferences)}`}`}
          onClick={() => setSelected(row.period)}
          className={cn("relative flex h-full items-end justify-center gap-1 rounded-sm px-1 hover:bg-muted/80 sm:gap-1.5", inspected.period === row.period && "bg-accent/65")}>
          <span className="w-2/5 max-w-6 rounded-t-xs bg-chart-1" style={{ height: `${100 * Number(savings ? row.movement.added : row.income) / ceiling}%` }} />
          <span className="w-2/5 max-w-6 rounded-t-xs bg-chart-2" style={{ height: `${100 * Number(savings ? row.movement.withdrawn : row.spent) / ceiling}%` }} />
          <span className="absolute -bottom-5 text-xs text-muted-foreground">{label(row.period)}</span>
        </button>)}
      </div>
    </div>
    <p aria-live="polite" className={selected ? "mt-2 text-xs text-muted-foreground" : "sr-only"}>
      {selected && `${label(inspected.period)} · ${savings ? `Added ${money(inspected.movement.added, data.preferences)} · Taken out ${money(inspected.movement.withdrawn, data.preferences)}` : `Income ${money(inspected.income, data.preferences)} · Spent ${money(inspected.spent, data.preferences)}`}`}
    </p>
  </Card>
}

function BudgetRows({ data, month, items, open }: Report & {
  items: Budget[]; open: (row: Budget) => void
}) {
  const totals = spending(data, month)
  return <div className="divide-y border-y">
    {items.map(row => {
      const used = totals.get(row.category) ?? 0n
      const difference = BigInt(row.amount) - used
      const category = data.categories.find(item => item.id === row.category)
      return <div className="flex items-center gap-1" key={row.id}>
        <button type="button" onClick={() => open(row)} className="grid min-h-14 flex-1 grid-cols-[minmax(0,1fr)_minmax(3rem,1fr)_auto] items-center gap-2 py-2 text-left text-sm hover:bg-accent/55 sm:gap-3">
          <span className="flex min-w-0 items-center gap-2"><CategoryIcon category={category} />
            <span className="min-w-0"><span className="block truncate font-medium">{category?.name}</span>
              <span className={cn("block text-xs text-muted-foreground", difference < 0n && "text-destructive")}>
                {money(difference < 0n ? -difference : difference, data.preferences)} {difference < 0n ? "over" : "left"}</span></span></span>
          <span className="text-primary"><Meter amount={used} target={row.amount} label={`${category?.name} budget used`} /></span>
          <span className="text-right font-medium tabular-nums">{money(used, data.preferences)} / {money(row.amount, data.preferences)}<span className="block text-xs font-normal text-muted-foreground">{percent(used, row.amount)}% used</span></span>
        </button>
      </div>
    })}
  </div>
}

function GoalHighlight({ data, month, goal, open, create }: Report & { goal?: Goal; open: (goal: Goal) => void; create: () => void }) {
  const saved = goal ? goalSaved(data, goal.id, month) : 0n
  const remaining = goal?.amount === null || goal?.amount === undefined ? 0n : BigInt(goal.amount) - saved
  return <Card className="justify-between gap-4 border-0 bg-accent/70 p-4 shadow-none sm:p-5">
    <div className="flex items-center justify-between gap-2">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-primary"><Target size={17} /> Savings pot</h2>
      {goal && <Button variant="ghost" size="sm" className="-mr-1 text-primary" onClick={() => open(goal)}>View pot<ChevronRight /></Button>}
    </div>
    {goal ? <>
      <h3 className="break-words text-xl font-semibold tracking-tight sm:text-2xl">{goal.name}</h3>
      <div><p className="text-3xl font-semibold tracking-tight tabular-nums sm:text-4xl">{money(saved, data.preferences)}</p>
        <p className="mt-1 text-sm text-muted-foreground">current balance</p></div>
      {goal.amount !== null && <div className="space-y-2 text-primary"><Meter amount={saved} target={goal.amount} label="Savings pot target progress" />
        <p className="flex justify-between text-sm font-medium"><span>{money(remaining > 0n ? remaining : 0n, data.preferences)} to target</span><span>{percent(saved, goal.amount)}%</span></p></div>}
      {goal.date && <p className="text-xs text-muted-foreground">Target {dateLabel(goal.date, undefined, data.preferences)}</p>}
    </> : <div className="space-y-3"><p className="text-sm text-muted-foreground">Create a pot to set money aside and track its balance.</p>
      <Button variant="outline" size="sm" onClick={create}><Plus /> New savings pot</Button></div>}
  </Card>
}

export function Overview({ data, month, add, entryDetail, budgetDetail, goalDetail, editGoal, editBudget }: Report & {
  add: () => void; entryDetail: (entry: Entry) => void; budgetDetail: (budget: Budget) => void
  goalDetail: (goal: Goal) => void; editGoal: EditGoal; editBudget: EditBudget
}) {
  const current = monthTotals(data, month)
  const previous = monthTotals(data, shiftMonth(month, -1))
  const used = percent(current.spent, current.income)
  const recent = data.entries.filter(row => row.date.startsWith(month)).reverse().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4)

  return <div className="grid gap-5 sm:gap-6 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
    <div className="grid gap-4 md:col-span-2 md:grid-cols-[minmax(0,2fr)_minmax(0,3.2fr)] md:items-center md:gap-5">
      <Card data-tour-target="overview" className="gap-2.5 rounded-[14px] border-0 bg-balance px-4 py-3 text-balance-foreground shadow-md sm:gap-3 sm:p-5">
        <div>
          <h2 className="text-sm font-medium">Available to spend</h2>
          <p className="mt-1 break-words text-[clamp(2rem,10vw,2.45rem)] leading-none font-semibold tracking-[-0.04em] tabular-nums sm:text-[clamp(2.4rem,3.55vw,3.2rem)]">{money(current.balance, data.preferences)}</p>
          <p className="mt-1 text-xs opacity-85">Savings deposits reduce this; withdrawals add back</p>
        </div>
        <div className="space-y-1 text-xs">
          <p><strong>{current.income > 0n ? `${used}%` : "—"}</strong> <span className="ml-1 opacity-90">of monthly income spent</span></p>
          <Meter amount={current.spent} target={current.income} label="Monthly income spent" />
        </div>
      </Card>
      <div className="md:border-l md:pl-4">
        <h2 className="mb-4 hidden text-base font-semibold md:block">This month</h2>
        <div className="grid grid-cols-3 divide-x">
          <Metric label="Income" value={money(current.income, data.preferences)} direction="up" detail={Change({ current: current.income, previous: previous.income, preferences: data.preferences })} />
          <Metric label="Spent" value={money(current.spent, data.preferences)} direction="down" detail={Change({ current: current.spent, previous: previous.spent, preferences: data.preferences })} />
          <Metric label="Net saved" value={money(current.saved, data.preferences)} detail="Added less taken out of pots this month" />
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
          <EntryCaption entry={row} category={data.categories.find(category => category.id === row.category)} preferences={data.preferences} showDate /><Signed entry={row} preferences={data.preferences} />
        </button>)}</div>
        : <Empty title="No activity this month" action={<Button size="sm" variant="outline" onClick={add}>Add transaction</Button>}>Add an expense or income to start your ledger.</Empty>}
    </section>
  </div>
}

function PlanEmpty({ title, children, action, label, tourTarget }: {
  title: string; children: ReactNode; action: () => void; label: string; tourTarget: "budgets" | "savings"
}) {
  return <section className="rounded-xl bg-accent/65 p-5 sm:p-8">
    <h2 className="text-[1.625rem] leading-tight font-semibold tracking-tight sm:text-[2rem]">{title}</h2>
    <p className="mt-3 max-w-[56ch] text-[15px] leading-relaxed text-muted-foreground">{children}</p>
    <Button data-tour-target={tourTarget} className="mt-5 h-11 motion-safe:full-motion:transition-transform motion-safe:full-motion:duration-100 motion-safe:full-motion:active:scale-[.97]" onClick={action}>{label}</Button>
  </section>
}

function PlanMeter({ amount, target, label, detail, over = false }: {
  amount: number | bigint; target: number | bigint; label: string; detail: string; over?: boolean
}) {
  const exactAmount = typeof amount === "bigint" ? amount : BigInt(amount)
  const exactTarget = typeof target === "bigint" ? target : BigInt(target)
  const fraction = exactTarget > 0n
    ? Math.min(1, Math.max(0, Number(exactAmount * 100_000n / exactTarget) / 100_000))
    : exactAmount > 0n ? 1 : 0
  return <div role="progressbar" aria-label={label} aria-valuenow={Math.round(fraction * 100)} aria-valuetext={detail}
    className="h-1.5 overflow-hidden rounded-full bg-muted">
    <span className={cn("block h-full origin-left rounded-full motion-safe:full-motion:transition-transform motion-safe:full-motion:duration-200 motion-safe:full-motion:ease-out",
      over ? "bg-destructive" : "bg-primary")}
      style={{ transform: "scaleX(" + fraction + ")" }} />
  </div>
}

function PlanDetails({ title, children }: { title: string; children: ReactNode }) {
  return <details className="group border-t">
    <summary className="flex min-h-11 list-none items-center justify-between gap-3 rounded-sm py-3 text-sm font-medium hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring [&::-webkit-details-marker]:hidden">
      {title}
      <ChevronDown aria-hidden="true" size={17} className="shrink-0 text-muted-foreground motion-safe:full-motion:transition-transform motion-safe:full-motion:duration-150 group-open:rotate-180" />
    </summary>
    <div className="pt-2 pb-4">{children}</div>
  </details>
}

export function Budgets({ data, month, edit, open, remove }: Report & {
  edit: EditBudget; open: (row: Budget) => void; remove: (row: Budget) => void
}) {
  const [all, setAll] = useState(false)
  if (!data.budgets.length) return <PlanEmpty title="Start with one category" action={() => edit()} label="New budget" tourTarget="budgets">
    Pick a category you spend on often, like groceries. Set a monthly limit you can work with.
  </PlanEmpty>

  const { preferences } = data
  const totals = spending(data, month)
  const categories = new Map(data.categories.map(category => [category.id, category.name]))
  const planned = data.budgets.reduce((sum, row) => sum + BigInt(row.amount), 0n)
  const used = data.budgets.reduce((sum, row) => sum + (totals.get(row.category) ?? 0n), 0n)
  const breakdown = [...totals.entries()].sort((a, b) => a[1] === b[1] ? 0 : a[1] > b[1] ? -1 : 1)
  const spent = [...totals.values()].reduce((sum, value) => sum + value, 0n)
  const now = today()
  const elapsed = month < now.slice(0, 7) ? 100 : month > now.slice(0, 7) ? 0 :
    percent(Number(now.slice(-2)), new Date(Date.parse(shiftMonth(month, 1) + "-01") - 86400000).getUTCDate())
  const items = all ? data.budgets : data.budgets.slice(0, 4)

  return <div className="space-y-6 sm:space-y-8">
    <section aria-label="Budget summary" className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-6">
      <div>
        <p className="text-sm font-medium text-muted-foreground">{used > planned ? "Over budget" : "Left in budget"}</p>
        <p className={cn("mt-1 [overflow-wrap:anywhere] text-[2.375rem] leading-none font-semibold tracking-[-0.04em] tabular-nums sm:text-[2.875rem]",
          used > planned ? "text-destructive" : "text-primary")}>{money(used > planned ? used - planned : planned - used, preferences)}</p>
        <p className="mt-2 text-sm text-muted-foreground">{money(used, preferences)} spent of {money(planned, preferences)} planned</p>
      </div>
      <div className="space-y-1 text-sm sm:text-right">
        <p className="font-semibold tabular-nums">{percent(used, planned)}% of plan used</p>
        <p className="text-[13px] text-muted-foreground">{elapsed}% of the month has passed</p>
      </div>
    </section>

    <section aria-labelledby="category-budgets">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 id="category-budgets" className="text-xl font-semibold tracking-tight sm:text-[1.3125rem]">Category budgets</h2>
        {data.budgets.length > 4 && <Button variant="ghost" className="h-11 text-primary" onClick={() => setAll(!all)}>
          {all ? "Show fewer" : "Show all " + data.budgets.length}
        </Button>}
      </div>
      <ul className="divide-y border-t">
        {items.map(row => {
          const amount = totals.get(row.category) ?? 0n
          const name = categories.get(row.category) ?? "Expense category"
          const over = amount > BigInt(row.amount)
          const usedText = money(amount, preferences) + " spent of " + money(row.amount, preferences)
          const difference = BigInt(row.amount) - amount
          const remaining = money(difference < 0n ? -difference : difference, preferences) + (over ? " over" : " left")
          return <li key={row.id} className="pb-4 sm:pb-5">
            <div className="flex items-start gap-2">
              <h3 className="min-w-0 flex-1">
                <button type="button" className="flex min-h-11 w-full items-center rounded-sm py-2 text-left [overflow-wrap:anywhere] font-semibold underline-offset-4 hover:underline"
                  onClick={() => open(row)}>{name}</button>
              </h3>
              <Menu label={"Actions for " + name + " budget"} actions={[
                { label: "Edit budget", run: () => edit(row) },
                { label: "Remove budget", run: () => remove(row), destructive: true },
              ]} />
            </div>
            <div className="mb-3 flex flex-wrap justify-between gap-x-4 gap-y-1 text-[13px] tabular-nums">
              <p className="min-w-0 [overflow-wrap:anywhere] text-muted-foreground">{usedText}</p>
              <p className={cn("min-w-0 [overflow-wrap:anywhere] font-medium", over ? "text-destructive" : "text-primary")}>{remaining}</p>
            </div>
            <PlanMeter amount={amount} target={row.amount} label={name + " budget used"} detail={usedText + ", " + remaining} over={over} />
          </li>
        })}
      </ul>
    </section>

    {breakdown.length > 0 && <PlanDetails title="Spending by category">
      <p className="mb-4 text-sm text-muted-foreground">{money(spent, preferences)} across {breakdown.length} {breakdown.length === 1 ? "category" : "categories"}</p>
      <ul className="grid max-w-xl gap-4">
        {breakdown.map(([id, amount]) => {
          const name = categories.get(id) ?? "Expense category"
          const share = percent(amount, spent) + "% of spending"
          return <li key={id} className="min-w-0 space-y-2">
            <p className="flex flex-wrap justify-between gap-x-3 gap-y-1 text-sm [overflow-wrap:anywhere]">
              <span>{name}</span><span className="tabular-nums text-muted-foreground">{money(amount, preferences)} ({percent(amount, spent)}%)</span>
            </p>
            <PlanMeter amount={amount} target={spent} label={name + " share of monthly spending"} detail={share} />
          </li>
        })}
      </ul>
    </PlanDetails>}
  </div>
}

export function Savings({ data, month, open, edit, contribute, remove }: Report & {
  open: (goal: Goal) => void; edit: EditGoal; contribute: (goal: Goal, direction: "deposit" | "withdrawal") => void; remove: (goal: Goal) => void
}) {
  if (!data.goals.length) return <PlanEmpty title="What are you saving for?" action={() => edit()} label="New savings pot" tourTarget="savings">
    A weekend away, a rainy day, or something just for you. Give it a pot.
  </PlanEmpty>

  const { preferences } = data
  const savedByGoal = goalSavedByGoal(data, month)
  const balances = data.goals.map(goal => ({ goal, balance: savedByGoal.get(goal.id) ?? 0n }))
  const total = balances.reduce((sum, { balance }) => sum + balance, 0n)
  const historyStart = shiftMonth(month, -4)
  const hasHistory = data.contributions.some(row => {
    const period = row.date.slice(0, 7)
    return period >= historyStart && period <= month
  })

  return <div className="space-y-7 sm:space-y-9">
    {total > 0n && <section aria-label="Savings summary">
      <p className="text-sm font-medium text-muted-foreground">Total in savings pots</p>
      <p className="mt-1 [overflow-wrap:anywhere] text-[2.375rem] leading-none font-semibold tracking-[-0.04em] text-primary tabular-nums sm:text-[2.875rem]">{money(total, preferences)}</p>
      <p className="mt-2 text-sm text-muted-foreground">Across {balances.length} {balances.length === 1 ? "pot" : "pots"}</p>
    </section>}

    <section aria-labelledby="your-pots">
      <h2 id="your-pots" className="mb-3 text-xl font-semibold tracking-tight sm:text-[1.3125rem]">Your pots</h2>
      <ul className="grid gap-x-7 gap-y-4 lg:grid-cols-2 lg:gap-y-6">
        {balances.map(({ goal, balance }) => {
          const saved = money(balance, preferences)
          const target = goal.amount
          const targetText = target === null ? undefined : "of " + money(target, preferences)
          const progressText = target === null ? undefined : balance >= BigInt(target) ? "Target reached" : money(BigInt(target) - balance, preferences) + " to go"
          return <li key={goal.id} className="flex min-w-0 flex-col border-t">
            <div className="flex items-start gap-2">
              <h3 className="min-w-0 flex-1">
                <button type="button" onClick={() => open(goal)}
                  className="flex min-h-11 w-full items-center rounded-sm py-2 text-left [overflow-wrap:anywhere] text-lg font-semibold underline-offset-4 hover:underline">{goal.name}</button>
              </h3>
              <Menu label={"Actions for " + goal.name} actions={[
                ...(balance > 0n ? [{ label: "Take money out", run: () => contribute(goal, "withdrawal") }] : []),
                { label: "Edit pot", run: () => edit(goal) },
                { label: "Delete pot", run: () => remove(goal), destructive: true },
              ]} />
            </div>
            <p className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 [overflow-wrap:anywhere] tabular-nums">
              <span className="text-2xl leading-tight font-semibold tracking-tight">{saved}</span>
              {targetText && <span className="text-[13px] text-muted-foreground">{targetText}</span>}
            </p>
            {target !== null && <div className="mt-3">
              <PlanMeter amount={balance} target={target} label={"Target progress for " + goal.name} detail={saved + " " + targetText + ", " + progressText} />
            </div>}
            <div className="mt-auto flex min-h-11 flex-wrap items-center justify-between gap-x-2 pt-1">
              {progressText && <p className="text-[13px] font-medium text-primary">{progressText}</p>}
              <Button variant="ghost" className="-mr-2 ml-auto h-11 px-2 text-primary motion-safe:full-motion:transition-transform motion-safe:full-motion:duration-100 motion-safe:full-motion:active:scale-[.97]"
                aria-label={"Add money to " + goal.name} onClick={() => contribute(goal, "deposit")}>Add money</Button>
            </div>
            {goal.date && <p className="pb-2 text-xs text-muted-foreground">Target {dateLabel(goal.date, undefined, preferences)}</p>}
          </li>
        })}
      </ul>
    </section>

    {hasHistory && <PlanDetails title="Monthly savings transfers"><Chart data={data} month={month} savings /></PlanDetails>}
  </div>
}

export function EntrySignIcon({ income }: { income: boolean }) {
  const Icon = income ? ArrowUpRight : ArrowDownRight
  return <Icon className={income ? "text-primary" : "text-destructive"} aria-hidden="true" />
}
