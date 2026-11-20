"use client"

import { useState } from "react"
import { ArrowLeft, ChevronRight, CircleHelp, Database, Download, FileUp, FolderOpen, Info, Laptop, LockKeyhole, Moon, Plus, Scale, ShieldCheck, Sun, Tags, Trash2, UsersRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { CategoryIcon, Choose, Empty, ErrorText, Menu, Modal, type Commit } from "@/components/shared"
import { currencies, type Category, type Currency, type Data, type Kind, type NewProfile, type Profile, type Theme } from "@/lib/finance"
import type { DataTool } from "@/components/data-tools"
import { Profiles } from "@/components/profiles"
import { SecuritySettings, type SecurityStatus } from "@/components/security-settings"

type Row = { title: string; description: string; icon: React.ElementType; danger?: boolean } & ({ href: string; run?: never } | { run: () => void; href?: never })

function Rows({ rows }: { rows: Row[] }) {
  return <Card className="gap-0 divide-y py-0 shadow-none">
    {rows.map(({ title, description, icon: Icon, href, run, danger }) => {
      const classes = "flex min-h-16 w-full items-center gap-3 rounded-lg p-3 text-left hover:bg-accent/55 sm:px-4"
      const content = <><span className={`grid size-9 shrink-0 place-items-center rounded-md ${danger ? "bg-destructive/10 text-destructive" : "bg-accent text-primary"}`}><Icon size={17} aria-hidden="true" /></span>
        <span className="min-w-0 flex-1"><span className={`block text-sm font-medium ${danger ? "text-destructive" : ""}`}>{title}</span>
          <span className="block text-sm text-muted-foreground">{description}</span></span><ChevronRight className="text-muted-foreground" size={16} aria-hidden="true" /></>
      return href ? <a key={title} href={href} className={classes}>{content}</a> :
        <button key={title} type="button" onClick={run} className={classes}>{content}</button>
    })}
  </Card>
}

const heading = {
  accounts: ["Profiles", "Keep separate ledgers on this browser."],
  categories: ["Categories", "Choose the names and icons used in reports."],
  data: ["Data & backup", "Manage the records on this device and the files you keep."],
  security: ["Security", "Choose how this browser protects access to the app and its stored records."],
  storage: ["Privacy & storage", "See where records are kept and how to manage them."],
  about: ["About & legal", "App information and notices in one place."],
}

export type SettingsPage = keyof typeof heading | "settings"

export function Settings({ route, data, commit, editCategory, removeCategory, openData, profiles, activeProfileId, addProfile, updateProfile, switchProfile, securityStatus, onSecurityChanged, lockSite }: {
  route: SettingsPage; data: Data; commit: Commit
  editCategory: (kind: Kind, category?: Category) => void; removeCategory: (category: Category) => void; openData: (tool: DataTool) => void
  profiles: Profile[]; activeProfileId: string
  addProfile: (profile: NewProfile) => Promise<void>; updateProfile: (profile: Profile) => Promise<void>; switchProfile: (id: string) => Promise<void>
  securityStatus: SecurityStatus; onSecurityChanged: () => Promise<void>; lockSite: () => void
}) {
  const [kind, setKind] = useState<Kind>("expense")
  const [note, setNote] = useState<"about" | "storage">()
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const preference = data.preferences
  const hasMoney = Boolean(data.entries.length || data.budgets.length || data.goals.length)
  const names = new Intl.DisplayNames(["en-GB"], { type: "currency" })

  async function save(patch: Partial<Data["preferences"]>) {
    setSaving(true)
    setError("")
    try {
      await commit(current => {
        if (patch.currency && patch.currency !== current.preferences.currency && (current.entries.length || current.budgets.length || current.goals.length)) {
          throw new Error("Back up and clear the current ledger before changing its currency.")
        }
        return { ...current, preferences: { ...current.preferences, ...patch } }
      }, "Preferences saved")
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "The preference could not be saved.")
    } finally { setSaving(false) }
  }

  return <div className="max-w-3xl space-y-6">
    {route !== "settings" && <div>
      <Button variant="ghost" size="sm" className="-ml-2 mb-3" asChild><a href="#settings"><ArrowLeft /> Settings</a></Button>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{heading[route][0]}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{heading[route][1]}</p>
    </div>}
    {route === "settings" && <>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Appearance</h2>
        <Card className="gap-4 p-4 shadow-none sm:p-5">
          <p className="text-sm text-muted-foreground">Choose how Money Manager looks.</p>
          <div role="group" aria-label="Theme" className="flex w-fit flex-wrap gap-1 rounded-lg bg-muted p-1">
            {([{ theme: "light", label: "Light", icon: Sun }, { theme: "dark", label: "Dark", icon: Moon }, { theme: "system", label: "System", icon: Laptop }] as const)
              .map(({ theme, label, icon: Icon }) => <Button key={theme} size="sm" variant={preference.theme === theme ? "outline" : "ghost"}
                className="max-md:min-h-11" aria-pressed={preference.theme === theme} disabled={saving} onClick={() => void save({ theme })}>
                <Icon aria-hidden="true" />{label}
              </Button>)}
          </div>
          <div className="flex items-center justify-between gap-4 border-t pt-4">
            <div><Label htmlFor="reduce-motion">Reduce motion</Label><p className="mt-1 text-sm text-muted-foreground">Skip interface animations and transitions.</p></div>
            <Switch id="reduce-motion" disabled={saving} checked={preference.reducedMotion ?? (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches)}
              onCheckedChange={value => void save({ reducedMotion: value })} />
          </div>
          {preference.reducedMotion !== null && <Button variant="ghost" className="self-start" size="sm" disabled={saving} onClick={() => void save({ reducedMotion: null })}>Use system motion setting</Button>}
        </Card>
      </section>
      <section className="space-y-3"><h2 className="text-lg font-semibold">Manage</h2>
        <Rows rows={[
          { title: "Profiles", description: "Switch ledgers or personalise a profile.", icon: UsersRound, href: "#accounts" },
          { title: "Categories", description: "Manage expense and income categories.", icon: Tags, href: "#categories" },
          { title: "Data & backup", description: "Back up, import, export or clear data.", icon: Database, href: "#data" },
          { title: "Security", description: "Set a site password and optionally encrypt this browser’s data.", icon: LockKeyhole, href: "#security" },
          { title: "Privacy & storage", description: "See what is stored on this device.", icon: ShieldCheck, href: "#storage" },
          { title: "About & legal", description: "App information, privacy and licences.", icon: Info, href: "#about" },
        ]} />
      </section>
      <section className="space-y-3"><h2 className="text-lg font-semibold">Currency</h2>
        <Card className="gap-3 p-4 shadow-none">
          {hasMoney ? <p className="text-sm"><strong>{preference.currency}</strong> · {names.of(preference.currency)}</p> :
            <Choose label="Ledger currency" value={preference.currency} options={currencies.map(currency => [currency, `${currency} · ${names.of(currency)}`])}
              onChange={currency => { if (!saving) void save({ currency: currency as Currency }) }} />}
          <p className="text-sm text-muted-foreground">{hasMoney ? "To change currency, download a backup and clear the current ledger first." : "Use one currency for all amounts in this ledger."}</p>
        </Card>
      </section>
      <ErrorText message={error} />
    </>}
    {route === "accounts" && <Profiles profiles={profiles} activeProfileId={activeProfileId} addProfile={addProfile} editProfile={updateProfile} switchProfile={switchProfile} />}
    {route === "categories" && <Tabs value={kind} className="gap-4" onValueChange={value => setKind(value as Kind)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TabsList aria-label="Category type">
          <TabsTrigger value="expense" className="text-muted-foreground">Expense</TabsTrigger>
          <TabsTrigger value="income" className="text-muted-foreground">Income</TabsTrigger>
        </TabsList>
        <Button onClick={() => editCategory(kind)}><Plus /> Add category</Button>
      </div>
      <TabsContent value={kind}>
        {data.categories.some(row => row.kind === kind) ?
          <ul className="divide-y rounded-xl border bg-card">{data.categories.filter(row => row.kind === kind).map(row => <li key={row.id} className="flex min-h-14 items-center gap-3 px-3">
            <CategoryIcon category={row} /><span className="min-w-0 flex-1 break-words text-sm font-medium">{row.name}</span>
            <Menu label={`Actions for ${row.name}`} actions={[
              { label: "Edit category", run: () => editCategory(kind, row) }, { label: "Delete category", run: () => removeCategory(row), destructive: true },
            ]} /></li>)}</ul> : <Empty title="No categories yet">Add a category to organise transactions.</Empty>}
      </TabsContent>
      <TabsContent value={kind === "expense" ? "income" : "expense"} forceMount hidden />
    </Tabs>}
    {route === "data" && <>
      <section className="space-y-3"><h2 className="font-semibold">Backup and restore</h2>
        <p className="text-sm text-muted-foreground">Backups and restore actions apply to {profiles.find(profile => profile.id === activeProfileId)?.name ?? "the current profile"} only.</p>
        <Rows rows={[
        { title: "Download backup", description: "Save a JSON copy for restoration.", icon: Download, run: () => openData("backup") },
        { title: "Restore from backup", description: "Review a backup before merging or replacing data.", icon: FolderOpen, run: () => openData("restore") },
      ]} /></section>
      <section className="space-y-3"><h2 className="font-semibold">Transactions</h2><Rows rows={[
        { title: "Import CSV", description: "Review transactions before adding them.", icon: FileUp, run: () => openData("import") },
        { title: "Export CSV", description: "Download a copy for a spreadsheet.", icon: Download, run: () => openData("export") },
      ]} /></section>
      <section className="space-y-3"><h2 className="font-semibold">Clear data</h2><Rows rows={[
        { title: "Clear local data", description: "Remove records from this profile only.", icon: Trash2, danger: true, run: () => openData("clear") },
      ]} /></section>
    </>}
    {route === "security" && <SecuritySettings status={securityStatus} onChanged={onSecurityChanged} onLock={lockSite} />}
    {route === "storage" && <>
      <Card className="gap-2 bg-accent/60 p-5 shadow-none">
        <h2 className="font-semibold">Saved on this device</h2>
        <p className="text-sm">Profiles, names and avatar choices are saved with your financial records in this browser. The site password is a local app lock. Optional storage encryption keeps all profiles encrypted in browser storage and decrypts them after unlock; without it, records remain readable there. Clearing site data may erase them. Backups do not include profile names or avatars.</p>
      </Card>
      <Rows rows={[
        { title: "Browser storage details", description: "See what is kept in this browser.", icon: Database, run: () => setNote("storage") },
        { title: "Data & backup", description: "Back up, import, export or clear records.", icon: Download, href: "#data" },
        { title: "Privacy Policy", description: "Read the privacy notice.", icon: ShieldCheck, href: "/privacy" },
      ]} />
    </>}
    {route === "about" && <Rows rows={[
      { title: "About", description: "What the app does and release information.", icon: CircleHelp, run: () => setNote("about") },
      { title: "Privacy Policy", description: "How your information is handled.", icon: ShieldCheck, href: "/privacy" },
      { title: "Licenses", description: "Third-party licences and notices.", icon: Scale, href: "/licenses" },
    ]} />}
    {note && <Modal title={note === "about" ? "About Money Manager" : "Browser storage details"}
      description={note === "about" ? "Version 0.1.0" : "Profile names, avatar choices, transactions, categories, budgets, savings pots, money transfers and preferences are stored in this browser."} close={() => setNote(undefined)}>
      <p className="text-sm">{note === "about" ? "Track income, expenses, budgets and savings in a local ledger on this device." :
        "The site password is a local screen lock. If optional storage encryption is off, anyone with browser access can read the records in storage. When it is on, the browser keeps encrypted records and needs the password to open them. Keep downloaded backups in a private location."}</p>
      <Button variant="outline" onClick={() => setNote(undefined)}>Close</Button>
    </Modal>}
  </div>
}
