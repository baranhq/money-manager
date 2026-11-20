"use client"

import { useEffect, useRef, useState } from "react"
import { CalendarDays, ChevronDown, Plus } from "lucide-react"
import { AccountMenu, navigation, settingsRoutes, Sidebar, type Route } from "@/components/navigation"
import { Activity } from "@/components/activity"
import { Budgets, EntrySignIcon, Overview, Savings } from "@/components/reports"
import { Settings, type SettingsPage } from "@/components/settings"
import { DataTools, type DataTool } from "@/components/data-tools"
import { BudgetForm, CategoryForm, ContributionForm, EntryForm, GoalForm } from "@/components/record-forms"
import { BudgetDetail, EntryDetail, GoalDetail, RemoveRecord, type Removal } from "@/components/record-details"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Skeleton } from "@/components/ui/skeleton"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Choose, Field, Modal } from "@/components/shared"
import { dateLabel, initialData, monthName, shiftMonth, today, type Budget, type Category, type Contribution, type Data, type Entry, type Goal, type Kind, type NewProfile, type Profile } from "@/lib/finance"
import { createProfile as createStoredProfile, InvalidSnapshot, readWorkspace, recoverData, switchProfile as switchStoredProfile, updateData, updateProfile as updateStoredProfile, type Workspace } from "@/lib/storage"
import { cn } from "@/lib/utils"

type Overlay =
  | { type: "add" }
  | { type: "entryForm"; row?: Entry; kind?: Kind }
  | { type: "entryDetail"; row: Entry }
  | { type: "budgetForm"; row?: Budget }
  | { type: "budgetDetail"; row: Budget }
  | { type: "goalForm"; row?: Goal }
  | { type: "goalDetail"; row: Goal }
  | { type: "contribution"; row?: Contribution; goal?: Goal }
  | { type: "category"; kind: Kind; row?: Category }
  | { type: "remove"; target: Removal }
  | { type: "dataTool"; mode: DataTool }

function getRoute(): Route {
  const hash = window.location.hash.slice(1)
  return [...navigation.map(item => item.id), ...settingsRoutes].find(route => route === hash) ?? "overview"
}

function MobileNavigation({ route, add, ready }: { route: Route; add: () => void; ready: boolean }) {
  const itemClass = "flex min-h-[60px] w-full flex-col items-center justify-start gap-1 rounded-lg pt-1 text-center text-xs leading-4"
  const item = ({ id, label, icon: Icon }: typeof navigation[number]) => <a key={id} href={`#${id}`} aria-current={route === id ? "page" : undefined}
    className={cn(itemClass, "text-muted-foreground", route === id && "font-semibold text-primary")}>
    <span className={cn("grid h-7 w-9 place-items-center rounded-md", route === id && "bg-accent")}><Icon size={17} aria-hidden="true" /></span>{label}
  </a>
  return <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t bg-card px-2 pt-1 pb-[max(.875rem,env(safe-area-inset-bottom))] md:hidden">
    {navigation.slice(0, 2).map(item)}
    <button type="button" onClick={add} disabled={!ready} className={cn(itemClass, "font-medium text-primary disabled:opacity-50")}>
      <span className="grid h-7 w-9 place-items-center rounded-md bg-primary text-primary-foreground"><Plus size={18} /></span>Add
    </button>
    {navigation.slice(2).map(item)}
  </nav>
}

function MonthControl({ month, setMonth, data }: { month: string; setMonth: (month: string) => void; data: Data }) {
  const [open, setOpen] = useState(false)
  const current = today().slice(0, 7)
  const months = [...new Set([
    month, ...Array.from({ length: 12 }, (_, index) => shiftMonth(current, 1 - index)),
    ...data.entries.map(row => row.date.slice(0, 7)), ...data.contributions.map(row => row.date.slice(0, 7)),
  ])].sort().reverse().slice(0, 36)
  return <Popover open={open} onOpenChange={setOpen}>
    <PopoverTrigger asChild><Button variant="outline" className="min-h-10 justify-between gap-3 bg-card max-md:min-h-11">
      <CalendarDays /> <span>{monthName(month, true)}</span><ChevronDown aria-hidden="true" />
    </Button></PopoverTrigger>
    <PopoverContent align="end" className="grid w-64 gap-4">
      <Choose label="Reporting month" value={months.includes(month) ? month : ""} options={months.map(value => [value, monthName(value)])}
        onChange={value => { setMonth(value); setOpen(false) }} />
      <Field label="Choose another month" name="month" type="month" min="1001-01" max="9998-12" value={month}
        onChange={event => {
          if (/^[1-9]\d{3}-(0[1-9]|1[0-2])$/.test(event.target.value) && event.target.validity.valid) setMonth(event.target.value)
        }} />
      <Button variant="outline" size="sm" onClick={() => { setMonth(current); setOpen(false) }}>This month</Button>
    </PopoverContent>
  </Popover>
}

export function MoneyManager() {
  const [route, setRoute] = useState<Route>("overview")
  const [month, setMonth] = useState(today().slice(0, 7))
  const [data, setData] = useState<Data>()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [activeProfileId, setActiveProfileId] = useState("")
  const [loadError, setLoadError] = useState<{ text: string; corrupted: boolean }>()
  const [overlay, setOverlay] = useState<Overlay>()
  const [status, setStatus] = useState("")
  const statusTimeout = useRef<number | undefined>(undefined)
  const channel = useRef<BroadcastChannel | undefined>(undefined)
  const latestRead = useRef(0)
  const report = navigation.find(item => item.id === route)
  const title = report?.label ?? "Settings"
  const activeProfile = profiles.find(profile => profile.id === activeProfileId)

  function applyWorkspace(workspace: Workspace) {
    setData(workspace.data)
    setProfiles(workspace.profiles)
    setActiveProfileId(workspace.activeProfileId)
    setLoadError(undefined)
  }

  function notify(text: string) {
    window.clearTimeout(statusTimeout.current)
    setStatus(text)
    statusTimeout.current = window.setTimeout(() => setStatus(""), 4500)
  }

  async function load() {
    const sequence = ++latestRead.current
    try {
      const next = await readWorkspace()
      if (sequence === latestRead.current) applyWorkspace(next)
    } catch (error) {
      if (sequence !== latestRead.current) return
      if (error instanceof InvalidSnapshot && error.profiles && error.activeProfileId) {
        setProfiles(error.profiles)
        setActiveProfileId(error.activeProfileId)
      }
      setLoadError({
        corrupted: error instanceof InvalidSnapshot,
        text: error instanceof InvalidSnapshot ? error.message : "This browser could not open local storage. Check whether site storage is available, then try again.",
      })
    }
  }

  useEffect(() => {
    function syncRoute() {
      setRoute(getRoute())
      setOverlay(undefined)
      window.scrollTo(0, 0)
    }
    syncRoute()
    void load()
    if (typeof BroadcastChannel === "function") {
      channel.current = new BroadcastChannel("money-manager-updates")
      channel.current.onmessage = () => { void load() }
    }
    const refresh = () => { if (document.visibilityState === "visible") void load() }
    window.addEventListener("hashchange", syncRoute)
    document.addEventListener("visibilitychange", refresh)
    return () => {
      channel.current?.close()
      window.removeEventListener("hashchange", syncRoute)
      document.removeEventListener("visibilitychange", refresh)
      window.clearTimeout(statusTimeout.current)
    }
  }, [])

  async function commit(change: (current: Data) => Data, message: string) {
    const profileId = activeProfileId
    const next = await updateData(change, profileId)
    ++latestRead.current
    setData(next)
    channel.current?.postMessage("updated")
    window.dispatchEvent(new Event("money-manager-preferences"))
    notify(message)
  }

  async function switchAccount(id: string) {
    const sequence = ++latestRead.current
    try {
      const next = await switchStoredProfile(id)
      if (sequence === latestRead.current) applyWorkspace(next)
      channel.current?.postMessage("updated")
      window.dispatchEvent(new Event("money-manager-preferences"))
      const name = next.profiles.find(profile => profile.id === id)?.name ?? "profile"
      notify(`Switched to ${name}`)
    } catch (error) {
      notify(error instanceof Error ? error.message : "The profile could not be opened.")
      throw error
    }
  }

  function selectAccount(id: string) {
    void switchAccount(id).catch(() => undefined)
  }

  async function addAccountProfile(profile: NewProfile) {
    const sequence = ++latestRead.current
    const next = await createStoredProfile(profile)
    if (sequence === latestRead.current) applyWorkspace(next)
    channel.current?.postMessage("updated")
    window.dispatchEvent(new Event("money-manager-preferences"))
    notify(`Switched to ${profile.name.trim()}`)
  }

  async function editAccountProfile(profile: Profile) {
    const next = await updateStoredProfile(profile)
    setProfiles(next)
    channel.current?.postMessage("updated")
    notify("Profile updated")
  }

  const close = () => setOverlay(undefined)
  const add = () => setOverlay({ type: "add" })
  const entryDetail = (row: Entry) => setOverlay({ type: "entryDetail", row })
  const entryEdit = (row?: Entry) => setOverlay({ type: "entryForm", row })
  const budgetDetail = (row: Budget) => setOverlay({ type: "budgetDetail", row })
  const budgetEdit = (row?: Budget) => setOverlay({ type: "budgetForm", row })
  const goalDetail = (row: Goal) => setOverlay({ type: "goalDetail", row })
  const goalEdit = (row?: Goal) => setOverlay({ type: "goalForm", row })
  const contribute = (goal?: Goal) => data?.goals.length ? setOverlay({ type: "contribution", goal }) : goalEdit()
  const remove = (target: Removal) => setOverlay({ type: "remove", target })
  const reportProps = data && { data, month }
  const operationProps = data && { data, close, commit }
  const hasHeader = !!report || route === "settings"
  const ready = Boolean(data && !loadError)

  return <TooltipProvider delayDuration={200}>
    <a href="#main-content" onClick={event => { event.preventDefault(); document.getElementById("main-content")?.focus() }}
      className="sr-only fixed top-2 left-2 z-50 rounded-md bg-primary p-3 text-primary-foreground focus:not-sr-only">Skip to content</a>
    <Sidebar route={route} profiles={profiles} activeProfile={activeProfile} onSwitch={selectAccount} />
    <main id="main-content" tabIndex={-1} className="mx-auto min-h-dvh min-w-0 px-4 pt-4 pb-28 outline-none md:ml-[72px] md:px-6 md:pt-6 md:pb-8 xl:ml-[246px] xl:px-8 xl:pt-6">
      <div className="mx-auto max-w-[1400px]">
        <header className={cn("relative mb-3 flex flex-wrap items-start justify-between gap-2 md:mb-4 md:gap-3", !hasHeader && "justify-end md:hidden")}>
          {hasHeader && <div className="max-md:pr-36"><h1 className="text-[1.85rem] leading-tight font-semibold tracking-[-0.035em] sm:text-[2.25rem]">{title}</h1>
            {route === "overview" && <p className="mt-1 hidden text-sm text-muted-foreground sm:block" suppressHydrationWarning>{dateLabel(today(), { weekday: "long", day: "numeric", month: "long" })}</p>}
          </div>}
          <div className={cn("ml-auto md:hidden", hasHeader && "absolute top-0 right-0")}><AccountMenu mobile profiles={profiles} activeProfile={activeProfile} onSwitch={selectAccount} /></div>
          {report && data && <div className="flex w-full flex-wrap items-center gap-2 md:ml-auto md:w-auto md:pt-2">
            <MonthControl month={month} setMonth={setMonth} data={data} />
            {ready && <Button className="hidden min-h-10 md:inline-flex" onClick={route === "budgets" ? () => budgetEdit() : route === "savings" ? () => contribute() : add}>
              <Plus /> {route === "budgets" ? "New budget" : route === "savings" ? (data.goals.length ? "Add money" : "New goal") : "Add transaction"}
            </Button>}
          </div>}
        </header>
        {loadError ? <div role="alert" className="max-w-lg space-y-3 rounded-xl border bg-card p-5">
          <h2 className="font-semibold">Could not read local data</h2><p className="text-sm text-muted-foreground">{loadError.text}</p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => void load()}>Retry</Button>
            {loadError.corrupted && <>
              <Button variant="outline" onClick={() => setOverlay({ type: "dataTool", mode: "restore" })}>Restore from backup</Button>
              <Button variant="outline" onClick={() => setOverlay({ type: "dataTool", mode: "clear" })}>Clear damaged data</Button>
            </>}
          </div>
        </div> : !reportProps ? <div role="status" className="space-y-5"><span className="sr-only">Opening your data</span>
          <Skeleton className="h-40 w-full md:w-2/5" /><Skeleton className="h-64 w-full md:w-3/5" />
        </div> : <>
          {route === "overview" && <Overview {...reportProps} add={add} entryDetail={entryDetail} budgetDetail={budgetDetail} goalDetail={goalDetail} editGoal={goalEdit} editBudget={budgetEdit} />}
          {route === "activity" && <Activity {...reportProps} add={add} open={entryDetail} edit={entryEdit} remove={row => remove({ type: "entry", row })} />}
          {route === "budgets" && <Budgets {...reportProps} edit={budgetEdit} open={budgetDetail} remove={row => remove({ type: "budget", row })} />}
          {route === "savings" && <Savings {...reportProps} open={goalDetail} edit={goalEdit} contribute={contribute} remove={row => remove({ type: "goal", row })} />}
          {!report && <Settings route={route as SettingsPage} data={reportProps.data} commit={commit} profiles={profiles} activeProfileId={activeProfileId}
            addProfile={addAccountProfile} updateProfile={editAccountProfile} switchProfile={switchAccount}
            editCategory={(kind: Kind, row?: Category) => setOverlay({ type: "category", kind, row })}
            removeCategory={row => remove({ type: "category", row })} openData={mode => setOverlay({ type: "dataTool", mode })} />}
        </>}
      </div>
    </main>
    <MobileNavigation route={route} add={add} ready={ready} />
    <div role="status" aria-live="polite" className={cn("pointer-events-none fixed right-4 bottom-24 z-40 max-w-[calc(100%-2rem)] rounded-md border bg-card px-4 py-2 text-sm font-medium shadow-sm md:bottom-6", !status && "sr-only")}>{status}</div>
    {overlay?.type === "add" && ready && <Modal title="Add entry" description="Choose the kind of transaction to record." close={close}>
      <div className="grid gap-2 sm:grid-cols-2">
        {(["expense", "income"] as const).map(kind => <Button key={kind} variant="outline" className="min-h-11 justify-start" onClick={() => setOverlay({ type: "entryForm", kind })}>
          <EntrySignIcon income={kind === "income"} /> {kind === "expense" ? "Expense" : "Income"}
        </Button>)}
      </div>
    </Modal>}
    {operationProps && overlay?.type === "entryForm" && <EntryForm {...operationProps} row={overlay.row} initialKind={overlay.kind} />}
    {data && overlay?.type === "entryDetail" && <EntryDetail row={overlay.row} data={data} close={close} edit={() => entryEdit(overlay.row)} remove={() => remove({ type: "entry", row: overlay.row })} />}
    {operationProps && overlay?.type === "budgetForm" && <BudgetForm {...operationProps} row={overlay.row} />}
    {data && overlay?.type === "budgetDetail" && <BudgetDetail row={overlay.row} data={data} month={month} close={close} edit={() => budgetEdit(overlay.row)} remove={() => remove({ type: "budget", row: overlay.row })} />}
    {operationProps && overlay?.type === "goalForm" && <GoalForm {...operationProps} row={overlay.row} />}
    {data && overlay?.type === "goalDetail" && <GoalDetail row={overlay.row} data={data} close={close} edit={() => goalEdit(overlay.row)}
      remove={() => remove({ type: "goal", row: overlay.row })} contribute={() => contribute(overlay.row)}
      editContribution={(row: Contribution) => setOverlay({ type: "contribution", row })} removeContribution={row => remove({ type: "contribution", row })} />}
    {operationProps && overlay?.type === "contribution" && <ContributionForm {...operationProps} row={overlay.row} goal={overlay.goal} />}
    {operationProps && overlay?.type === "category" && <CategoryForm {...operationProps} initialKind={overlay.kind} row={overlay.row} />}
    {operationProps && overlay?.type === "remove" && <RemoveRecord {...operationProps} target={overlay.target} />}
    {overlay?.type === "dataTool" && (data || loadError?.corrupted) && <DataTools mode={overlay.mode} data={data ?? initialData()} commit={commit} close={close} notify={notify}
      profileName={activeProfile?.name ?? "Personal"} profileId={activeProfileId || "personal"}
      recover={loadError?.corrupted ? async replacement => {
        const next = await recoverData(replacement, activeProfileId)
        ++latestRead.current
        setData(next)
        setLoadError(undefined)
        channel.current?.postMessage("updated")
        window.dispatchEvent(new Event("money-manager-preferences"))
        notify(replacement ? "Backup restored" : "Damaged records cleared")
      } : undefined} />}
  </TooltipProvider>
}
