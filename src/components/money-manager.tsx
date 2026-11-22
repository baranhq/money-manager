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
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Skeleton } from "@/components/ui/skeleton"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Onboarding } from "@/components/onboarding"
import { Choose, Field, Modal } from "@/components/shared"
import { dateLabel, initialData, monthName, shiftMonth, today, type Budget, type Category, type Contribution, type ContributionDirection, type Data, type Entry, type Goal, type Kind, type NewProfile, type Profile } from "@/lib/finance"
import { createProfile as createStoredProfile, finishOnboarding, InvalidSnapshot, lockSite as lockStoredSite, readSecurityStatus, readWorkspace, recoverData, switchProfile as switchStoredProfile, unlockSitePassword, updateData, updateProfile as updateStoredProfile, type Workspace } from "@/lib/storage"
import type { OnboardingDraft } from "@/lib/onboarding"
import type { SecurityStatus } from "@/components/security-settings"
import { cn } from "@/lib/utils"

type Overlay =
  | { type: "add" }
  | { type: "entryForm"; row?: Entry; kind?: Kind }
  | { type: "entryDetail"; row: Entry }
  | { type: "budgetForm"; row?: Budget }
  | { type: "budgetDetail"; row: Budget }
  | { type: "goalForm"; row?: Goal }
  | { type: "goalDetail"; row: Goal }
  | { type: "contribution"; row?: Contribution; goal?: Goal; direction?: ContributionDirection }
  | { type: "category"; kind: Kind; row?: Category }
  | { type: "remove"; target: Removal }
  | { type: "dataTool"; mode: DataTool }

function getRoute(): Route {
  const hash = window.location.hash.slice(1)
  return [...navigation.map(item => item.id), ...settingsRoutes].find(route => route === hash) ?? "overview"
}

function MobileNavigation({ route, add, ready }: { route: Route; add: () => void; ready: boolean }) {
  const itemClass = "grid h-[60px] content-center justify-items-center gap-1 rounded-lg p-0 pt-1 text-xs leading-4"
  const item = ({ id, label, icon: Icon }: typeof navigation[number]) => <a key={id} href={`#${id}`} aria-current={route === id ? "page" : undefined}
    className={cn(itemClass, "text-muted-foreground", route === id && "font-semibold text-primary")}>
    <span className={cn("grid h-7 w-9 place-items-center rounded-md", route === id && "bg-accent")}><Icon size={17} aria-hidden="true" /></span>
    <span>{label}</span>
  </a>
  return <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t bg-card px-2 pt-1 pb-[max(.875rem,env(safe-area-inset-bottom))] md:hidden">
    {navigation.slice(0, 2).map(item)}
    <button type="button" onClick={add} disabled={!ready}
      className={cn(itemClass, "w-full appearance-none font-medium text-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50")}>
      <span className="grid h-7 w-9 place-items-center rounded-md bg-primary text-primary-foreground"><Plus size={17} aria-hidden="true" /></span>
      <span>Add</span>
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
      <CalendarDays /> <span>{monthName(month, true, data.preferences)}</span><ChevronDown aria-hidden="true" />
    </Button></PopoverTrigger>
    <PopoverContent align="end" className="grid w-64 gap-4">
      <Choose label="Reporting month" value={months.includes(month) ? month : ""} options={months.map(value => [value, monthName(value, false, data.preferences)])}
        onChange={value => { setMonth(value); setOpen(false) }} />
      <Field label="Choose another month" name="month" type="month" min="1001-01" max="9998-12" value={month}
        onChange={event => {
          if (/^[1-9]\d{3}-(0[1-9]|1[0-2])$/.test(event.target.value) && event.target.validity.valid) setMonth(event.target.value)
        }} />
      <Button variant="outline" size="sm" onClick={() => { setMonth(current); setOpen(false) }}>This month</Button>
    </PopoverContent>
  </Popover>
}

function UnlockScreen({ storageEncrypted, busy, error, unlock }: {
  storageEncrypted: boolean; busy: boolean; error: string; unlock: (password: string) => Promise<boolean>
}) {
  const [password, setPassword] = useState("")
  return <main id="main-content" tabIndex={-1} className="grid min-h-dvh place-items-center px-4 py-10 outline-none">
    <div className="w-full max-w-sm space-y-5">
      <div><h1 className="text-3xl font-semibold tracking-tight">Unlock Money Manager</h1>
        <p className="mt-2 text-sm text-muted-foreground">Enter the site password set for this browser.</p></div>
      <Card className="gap-4 p-5 shadow-none">
        <form className="grid gap-4" onSubmit={event => {
          event.preventDefault()
          void unlock(password).then(opened => { if (opened) setPassword("") })
        }}>
          <div className="grid gap-2">
            <label htmlFor="site-password" className="text-sm font-medium">Site password</label>
            <Input id="site-password" type="password" value={password} onChange={event => setPassword(event.target.value)}
              autoComplete="current-password" autoFocus required maxLength={128} />
          </div>
          {error && <p role="alert" className="rounded-md border border-destructive/35 bg-destructive/5 p-3 text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={busy || password.length < 1} className="min-h-11">{busy ? "Unlocking…" : "Unlock"}</Button>
        </form>
      </Card>
      <p className="text-sm text-muted-foreground">{storageEncrypted
        ? "This browser keeps the profiles encrypted in storage and decrypts them after you unlock. The password is not sent to a server."
        : "This password is a local app lock. Browser storage is not encrypted, and this does not create an online account."}</p>
      <p className="text-sm text-muted-foreground">If you open the app over plain HTTP on a network IP, someone who can change that network traffic could replace the page or capture your password. Use HTTPS before relying on password protection.</p>
    </div>
  </main>
}

export function MoneyManager() {
  const [route, setRoute] = useState<Route>("overview")
  const [month, setMonth] = useState(today().slice(0, 7))
  const [data, setData] = useState<Data>()
  const [onboarding, setOnboarding] = useState<OnboardingDraft>()
  const [setupArrival, setSetupArrival] = useState(false)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [activeProfileId, setActiveProfileId] = useState("")
  const [loadError, setLoadError] = useState<{ text: string; corrupted: boolean }>()
  const [overlay, setOverlay] = useState<Overlay>()
  const [status, setStatus] = useState("")
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus>()
  const [securityReady, setSecurityReady] = useState(false)
  const [siteLocked, setSiteLocked] = useState(false)
  const [unlockError, setUnlockError] = useState("")
  const [unlockBusy, setUnlockBusy] = useState(false)
  const statusTimeout = useRef<number | undefined>(undefined)
  const channel = useRef<BroadcastChannel | undefined>(undefined)
  const securityChannel = useRef<BroadcastChannel | undefined>(undefined)
  const securityStatusRef = useRef<SecurityStatus | undefined>(undefined)
  const securityReadyRef = useRef(false)
  const siteLockedRef = useRef(false)
  const securityEpoch = useRef(0)
  const latestRead = useRef(0)
  const report = navigation.find(item => item.id === route)
  const title = report?.label ?? (route === "security" ? "Security" : "Settings")
  const activeProfile = profiles.find(profile => profile.id === activeProfileId)

  function applyWorkspace(workspace: Workspace) {
    setData(workspace.data)
    setOnboarding(workspace.onboarding)
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
    if (!securityReadyRef.current || siteLockedRef.current) return
    const sequence = ++latestRead.current
    try {
      const next = await readWorkspace()
      if (sequence === latestRead.current) applyWorkspace(next)
    } catch (error) {
      if (sequence !== latestRead.current) return
      if (error instanceof InvalidSnapshot && error.profiles && error.activeProfileId) {
        setProfiles(error.profiles)
        setActiveProfileId(error.activeProfileId)
      } else {
        setData(undefined)
        setProfiles([])
        setActiveProfileId("")
      }
      setLoadError({
        corrupted: error instanceof InvalidSnapshot,
        text: error instanceof InvalidSnapshot ? error.message : "This browser could not open local storage. Check whether site storage is available, then try again.",
      })
    }
  }

  function setLockedState(locked: boolean) {
    siteLockedRef.current = locked
    setSiteLocked(locked)
    setUnlockError("")
    if (locked) {
      ++securityEpoch.current
      ++latestRead.current
      setData(undefined)
      setOnboarding(undefined)
      setProfiles([])
      setActiveProfileId("")
      setLoadError(undefined)
      setOverlay(undefined)
    }
  }

  function failClosed(error: unknown) {
    lockStoredSite()
    setLockedState(true)
    securityStatusRef.current = undefined
    setSecurityStatus(undefined)
    setLoadError({
      corrupted: false,
      text: error instanceof Error ? error.message : "The local security settings could not be read. Your records are hidden until they can be checked.",
    })
  }

  function lockApp(broadcast = true) {
    lockStoredSite()
    if (!securityStatusRef.current?.configured) return
    setLockedState(true)
    if (broadcast) securityChannel.current?.postMessage("lock")
  }

  async function initialize() {
    try {
      const next = await readSecurityStatus()
      securityStatusRef.current = next
      setSecurityStatus(next)
      securityReadyRef.current = true
      setSecurityReady(true)
      if (next.configured) setLockedState(true)
      else {
        setLockedState(false)
        await load()
      }
    } catch (error) {
      securityReadyRef.current = true
      setSecurityReady(true)
      failClosed(error)
    }
  }

  async function refreshSecurityStatus() {
    const next = await readSecurityStatus()
    securityStatusRef.current = next
    setSecurityStatus(next)
    if (next.configured) {
      lockStoredSite()
      setLockedState(true)
    }
    else if (siteLockedRef.current) {
      lockStoredSite()
      setLockedState(false)
      await load()
    }
  }

  async function unlock(password: string) {
    const epoch = securityEpoch.current
    setUnlockBusy(true)
    setUnlockError("")
    try {
      await unlockSitePassword(password)
      if (epoch !== securityEpoch.current) {
        lockStoredSite()
        return false
      }
      setLockedState(false)
      await load()
      securityChannel.current?.postMessage("unlocked")
      return true
    } catch (error) {
      lockStoredSite()
      setUnlockError(error instanceof Error ? error.message : "The password could not unlock this browser.")
      return false
    } finally { setUnlockBusy(false) }
  }

  async function securityChanged() {
    const next = await readSecurityStatus()
    securityStatusRef.current = next
    setSecurityStatus(next)
    securityChannel.current?.postMessage("changed")
    notify("Security settings updated")
  }

  useEffect(() => {
    function syncRoute() {
      setRoute(getRoute())
      setOverlay(undefined)
      window.scrollTo(0, 0)
    }
    syncRoute()
    void initialize()
    if (typeof BroadcastChannel === "function") {
      channel.current = new BroadcastChannel("money-manager-updates")
      channel.current.onmessage = () => { void load() }
      securityChannel.current = new BroadcastChannel("money-manager-security")
      securityChannel.current.onmessage = event => {
        if (event.data === "lock" || event.data === "unlocked") lockApp(false)
        if (event.data === "changed") void refreshSecurityStatus().catch(failClosed)
      }
    }
    const refresh = () => { if (document.visibilityState === "visible") void load() }
    window.addEventListener("hashchange", syncRoute)
    document.addEventListener("visibilitychange", refresh)
    return () => {
      channel.current?.close()
      securityChannel.current?.close()
      window.removeEventListener("hashchange", syncRoute)
      document.removeEventListener("visibilitychange", refresh)
      window.clearTimeout(statusTimeout.current)
    }
  }, [])

  async function commit(change: (current: Data) => Data, message: string) {
    const epoch = securityEpoch.current
    const profileId = activeProfileId
    const next = await updateData(change, profileId)
    if (siteLockedRef.current || epoch !== securityEpoch.current) return
    ++latestRead.current
    setData(next)
    channel.current?.postMessage("updated")
    window.dispatchEvent(new Event("money-manager-preferences"))
    notify(message)
  }

  async function completeSetup(draft: OnboardingDraft, destination: "skip" | "dashboard" | "transaction") {
    const epoch = securityEpoch.current
    const result = await finishOnboarding(draft, destination === "skip")
    if (siteLockedRef.current || epoch !== securityEpoch.current) return
    ++latestRead.current
    applyWorkspace(result.workspace)
    if (!result.applied) return
    window.history.replaceState(window.history.state, "", "#overview")
    setRoute("overview")
    window.scrollTo(0, 0)
    setOverlay(destination === "transaction" ? { type: "entryForm" } : undefined)
    setSetupArrival(destination !== "transaction" && draft.preferences.reducedMotion !== true &&
      window.matchMedia("(prefers-reduced-motion: no-preference)").matches)
    channel.current?.postMessage("updated")
    window.dispatchEvent(new Event("money-manager-preferences"))
    if (destination !== "transaction") window.requestAnimationFrame(() => document.getElementById("main-content")?.focus())
  }

  async function switchAccount(id: string) {
    const epoch = securityEpoch.current
    const sequence = ++latestRead.current
    try {
      const next = await switchStoredProfile(id)
      if (siteLockedRef.current || epoch !== securityEpoch.current || sequence !== latestRead.current) return
      applyWorkspace(next)
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
    const epoch = securityEpoch.current
    const sequence = ++latestRead.current
    const next = await createStoredProfile(profile)
    if (siteLockedRef.current || epoch !== securityEpoch.current || sequence !== latestRead.current) return
    applyWorkspace(next)
    channel.current?.postMessage("updated")
    window.dispatchEvent(new Event("money-manager-preferences"))
    notify(`Switched to ${profile.name.trim()}`)
  }

  async function editAccountProfile(profile: Profile) {
    const epoch = securityEpoch.current
    const next = await updateStoredProfile(profile)
    if (siteLockedRef.current || epoch !== securityEpoch.current) return
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
  const contribute = (goal?: Goal, direction: ContributionDirection = "deposit") => data?.goals.length ? setOverlay({ type: "contribution", goal, direction }) : goalEdit()
  const remove = (target: Removal) => setOverlay({ type: "remove", target })
  const reportProps = data && { data, month }
  const operationProps = data && { data, close, commit }
  const hasHeader = !!report || route === "settings"
  const planPage = route === "budgets" || route === "savings"
  const emptyPlan = route === "budgets" ? data?.budgets.length === 0 : route === "savings" && data?.goals.length === 0
  const ready = Boolean(data && !loadError)
  const skipLink = <a href="#main-content" onClick={event => { event.preventDefault(); document.getElementById("main-content")?.focus() }}
    className="sr-only fixed top-2 left-2 z-50 rounded-md bg-primary p-3 text-primary-foreground focus:not-sr-only">Skip to content</a>

  if (!securityReady || (!siteLocked && !data && !loadError)) return <TooltipProvider delayDuration={200}>{skipLink}<main id="main-content" tabIndex={-1} className="grid min-h-dvh place-items-center px-4 outline-none" role="status">
    <div className="w-full max-w-sm space-y-4"><span className="sr-only">Opening Money Manager</span>
      <Skeleton className="h-12 w-2/3" /><Skeleton className="h-24 w-full" /></div>
  </main></TooltipProvider>
  if (siteLocked && securityStatus) return <TooltipProvider delayDuration={200}>{skipLink}
    <UnlockScreen storageEncrypted={securityStatus.storageEncrypted} busy={unlockBusy} error={unlockError} unlock={unlock} />
  </TooltipProvider>
  if (onboarding && !loadError && !siteLocked) return <Onboarding initial={onboarding} finish={completeSetup} reload={load} />

  return <TooltipProvider delayDuration={200}>
    {skipLink}
    <Sidebar route={route} profiles={profiles} activeProfile={activeProfile} onSwitch={selectAccount} />
    <main id="main-content" tabIndex={-1}
      className={cn("mx-auto min-h-dvh min-w-0 px-4 pt-4 pb-28 outline-none md:ml-[72px] md:px-6 md:pt-6 md:pb-8 xl:ml-[246px] xl:px-8 xl:pt-6",
        setupArrival && "motion-safe:full-motion:animate-in motion-safe:full-motion:fade-in motion-safe:full-motion:duration-150 motion-safe:full-motion:ease-out")}
      onAnimationEnd={event => { if (setupArrival && event.target === event.currentTarget) setSetupArrival(false) }}>
      <div className={cn("mx-auto", emptyPlan ? "max-w-[38.875rem]" : planPage ? "max-w-[62.75rem]" : report ? "max-w-[1400px]" : "max-w-3xl")}>
        <header className={cn("relative mb-3 flex flex-wrap items-start justify-between gap-2 md:mb-4 md:gap-3",
          planPage && "mb-7 md:mb-9 md:pt-3", !hasHeader && "justify-end md:hidden")}>
          {hasHeader && <div className="max-md:pr-36"><h1 className="text-[1.85rem] leading-tight font-semibold tracking-[-0.035em] sm:text-[2.25rem]">{title}</h1>
            {route === "overview" && <p className="mt-1 hidden text-sm text-muted-foreground sm:block" suppressHydrationWarning>{dateLabel(today(), { weekday: "long", day: "numeric", month: "long" }, data?.preferences)}</p>}
          </div>}
          <div className={cn("ml-auto md:hidden", hasHeader && "absolute top-0 right-0")}><AccountMenu mobile profiles={profiles} activeProfile={activeProfile} onSwitch={selectAccount} /></div>
          {report && data && !emptyPlan && <div className={cn("flex w-full flex-wrap items-center gap-2 md:ml-auto md:w-auto md:pt-2", planPage && "mt-2 md:mt-0 md:gap-3 md:pt-0")}>
            <MonthControl month={month} setMonth={setMonth} data={data} />
            {ready && (planPage ? <Button className="ml-auto min-h-11 motion-safe:full-motion:transition-transform motion-safe:full-motion:duration-100 motion-safe:full-motion:active:scale-[.97]"
              onClick={route === "budgets" ? () => budgetEdit() : () => goalEdit()}>
              {route === "budgets" ? "New budget" : "New savings pot"}
            </Button> : <Button className="hidden min-h-10 md:inline-flex" onClick={add}><Plus /> Add transaction</Button>)}
          </div>}
        </header>
        {loadError ? <div role="alert" className="max-w-lg space-y-3 rounded-xl border bg-card p-5">
          <h2 className="font-semibold">Could not read local data</h2><p className="text-sm text-muted-foreground">{loadError.text}</p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => void initialize()}>Retry</Button>
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
            removeCategory={row => remove({ type: "category", row })} openData={mode => setOverlay({ type: "dataTool", mode })}
            securityStatus={securityStatus ?? { configured: false, storageEncrypted: false }} onSecurityChanged={securityChanged} lockSite={() => lockApp()} />}
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
      remove={() => remove({ type: "goal", row: overlay.row })} contribute={direction => contribute(overlay.row, direction)}
      editContribution={(row: Contribution) => setOverlay({ type: "contribution", row })} removeContribution={row => remove({ type: "contribution", row })} />}
    {operationProps && overlay?.type === "contribution" && <ContributionForm {...operationProps} row={overlay.row} goal={overlay.goal} initialDirection={overlay.direction} />}
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
