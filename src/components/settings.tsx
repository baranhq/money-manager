"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, ChevronRight, CircleHelp, Database, Download, FileUp, FolderOpen, Info, Laptop, LockKeyhole, Moon, Plus, Scale, ShieldCheck, Sun, Tags, Trash2, UsersRound, Wallet } from "lucide-react"
import { BrandLogo } from "@/components/brand-logo"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { CategoryIcon, Choose, Empty, ErrorText, Field, Menu, Modal, type Commit } from "@/components/shared"
import { canonicalLocale, currencies, currencyDigits, dateLabel, hasLedgerAmounts, money, type Category, type Currency, type Data, type Kind, type NewProfile, type Profile, type Theme } from "@/lib/finance"
import { privacyLinks } from "@/lib/privacy-links"
import { localeOptions, localePresets } from "@/lib/regional-options"
import type { DataTool } from "@/components/data-tools"
import { Profiles } from "@/components/profiles"
import { LedgerAccounts } from "@/components/ledger-accounts"
import { SecuritySettings, type SecurityStatus } from "@/components/security-settings"

type Row = { title: string; description: string; icon: React.ElementType; danger?: boolean } & ({ href: string; run?: never } | { run: () => void; href?: never })

function Rows({ rows }: { rows: Row[] }) {
  return <Card className="gap-0 divide-y py-0 shadow-none">
    {rows.map(({ title, description, icon: Icon, href, run, danger }) => {
      const classes = "flex min-h-16 w-full items-center gap-3 rounded-lg p-3 text-left hover:bg-accent/55 sm:px-4"
      const content = <><span className={`grid size-9 shrink-0 place-items-center rounded-md ${danger ? "bg-destructive/10 text-destructive" : "bg-accent text-primary"}`}><Icon size={17} aria-hidden="true" /></span>
        <span className="min-w-0 flex-1"><span className={`block text-sm font-medium ${danger ? "text-destructive" : ""}`}>{title}</span>
          <span className="block text-sm text-muted-foreground">{description}</span></span><ChevronRight className="text-muted-foreground" size={16} aria-hidden="true" /></>
      return href ? <a key={title} href={href} data-tour-target={href === "#ledger-accounts" ? "settings" : undefined} className={classes}>{content}</a> :
        <button key={title} type="button" onClick={run} className={classes}>{content}</button>
    })}
  </Card>
}

const heading = {
  accounts: ["Profiles", "Keep separate ledgers on this browser."],
  "ledger-accounts": ["Accounts", "Manage the accounts and opening balances in this ledger."],
  categories: ["Categories", "Choose the names and icons used in reports."],
  data: ["Data & backup", "Manage the records on this device and the files you keep."],
  security: ["Security", "Choose how this browser protects access to the app and its stored records."],
  storage: ["Privacy & storage", "See where records are kept and how to manage them."],
  about: ["About & legal", "App information and notices in one place."],
}

export type SettingsPage = keyof typeof heading | "settings"

export function Settings({ route, data, commit, editCategory, removeCategory, openData, profiles, activeProfileId, addProfile, updateProfile, switchProfile, securityStatus, onSecurityChanged, lockSite, replayTour, onAccountEditorChange }: {
  route: SettingsPage; data: Data; commit: Commit
  editCategory: (kind: Kind, category?: Category) => void; removeCategory: (category: Category) => void; openData: (tool: DataTool) => void
  profiles: Profile[]; activeProfileId: string
  addProfile: (profile: NewProfile) => Promise<void>; updateProfile: (profile: Profile) => Promise<void>; switchProfile: (id: string) => Promise<void>
  securityStatus: SecurityStatus; onSecurityChanged: () => Promise<void>; lockSite: () => void; replayTour: () => void; onAccountEditorChange: (active: boolean) => void
}) {
  const [kind, setKind] = useState<Kind>("expense")
  const [note, setNote] = useState<"about" | "storage">()
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const [localeDraft, setLocaleDraft] = useState(data.preferences.locale)
  const [customLocaleOpen, setCustomLocaleOpen] = useState(!localePresets.includes(data.preferences.locale as typeof localePresets[number]))
  const preference = data.preferences
  const hasMoney = hasLedgerAmounts(data)
  const names = new Intl.DisplayNames([preference.locale], { type: "currency" })
  const currencyOptions = [...new Set([preference.currency, ...currencies])].sort().map(currency => [
    currency,
    `${currency} · ${names.of(currency) ?? currency}${currency === "BGN" ? " (historic)" : ""}`,
  ] as const)

  useEffect(() => {
    setLocaleDraft(preference.locale)
    setCustomLocaleOpen(!localePresets.includes(preference.locale as typeof localePresets[number]))
  }, [preference.locale])

  async function save(patch: Partial<Data["preferences"]>) {
    setSaving(true)
    setError("")
    try {
      await commit(current => {
        if (patch.currency && patch.currency !== current.preferences.currency && hasLedgerAmounts(current)) {
          throw new Error("Back up and clear the current ledger before changing its currency.")
        }
        return { ...current, preferences: { ...current.preferences, ...patch } }
      }, "Preferences saved")
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "The preference could not be saved.")
    } finally { setSaving(false) }
  }

  function applyLocale() {
    const locale = canonicalLocale(localeDraft)
    if (!locale) { setError("Enter a valid locale tag, such as tr-TR or fr-CA."); return }
    setLocaleDraft(locale)
    setCustomLocaleOpen(!localePresets.includes(locale as typeof localePresets[number]))
    if (!saving && locale !== preference.locale) void save({ locale })
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
      <section className="space-y-3"><h2 className="text-lg font-semibold">Currency & formats</h2>
        <Card className="gap-4 p-4 shadow-none sm:p-5">
          <p className="text-sm text-muted-foreground">Choose how amounts and dates appear. The interface language stays English.</p>
          {hasMoney ? <div className="grid gap-2">
            <p className="text-sm font-medium">Ledger currency</p>
            <p className="text-sm font-medium">{preference.currency} · {names.of(preference.currency) ?? preference.currency}</p>
            <p className="text-xs text-muted-foreground">Currency is fixed once amounts are recorded. Back up and clear the ledger to start again in another currency; this setting does not convert amounts.</p>
          </div> : <Choose label="Ledger currency" value={preference.currency} options={currencyOptions}
            triggerClassName="max-w-[22rem]"
            contentProps={{ position: "popper", align: "start", collisionPadding: 12, className: "w-[min(22rem,calc(100vi_-_1.5rem))] max-h-[min(18rem,var(--radix-select-content-available-height))]" }}
            onChange={currency => { if (!saving) void save({ currency: currency as Currency, currencyDigits: currencyDigits(currency) }) }} />}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid min-w-0 gap-2">
              <Choose label="Formatting locale" value={customLocaleOpen ? "custom" : preference.locale} options={localeOptions}
                onChange={value => {
                  if (value === "custom") { setCustomLocaleOpen(true); setLocaleDraft(preference.locale); return }
                  setCustomLocaleOpen(false)
                  setLocaleDraft(value)
                  if (!saving) void save({ locale: value })
                }} />
              {customLocaleOpen && <div className="grid gap-2">
                <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                  <Field label="Custom locale tag" name="custom-locale" value={localeDraft} maxLength={64} placeholder="e.g. tr-TR"
                    onChange={event => setLocaleDraft(event.target.value)} />
                  <Button type="button" variant="outline" disabled={saving || !localeDraft.trim()} onClick={applyLocale}>Apply locale</Button>
                </div>
                <p className="text-xs text-muted-foreground">Use a locale tag such as tr-TR, fr-CA or sr-Latn-RS.</p>
              </div>}
            </div>
            <Choose label="Date format" value={preference.dateFormat} options={[
              ["regional", "Use locale format"], ["dmy", "DD/MM/YYYY"], ["mdy", "MM/DD/YYYY"], ["ymd", "YYYY-MM-DD"],
            ]} onChange={value => { if (!saving) void save({ dateFormat: value as Data["preferences"]["dateFormat"] }) }} />
            <Choose label="Number separators" value={preference.numberFormat} options={[
              ["regional", "Use locale format"], ["period", "1,234.56"], ["comma", "1.234,56"], ["space", "1 234,56"],
            ]} onChange={value => { if (!saving) void save({ numberFormat: value as Data["preferences"]["numberFormat"] }) }} />
            <Choose label="Currency display" value={preference.currencyDisplay} options={[
              ["symbol", "Local currency symbol"], ["code", "ISO currency code"],
            ]} onChange={value => { if (!saving) void save({ currencyDisplay: value as Data["preferences"]["currencyDisplay"] }) }} />
          </div>
          <div className="rounded-lg bg-accent/55 p-3">
            <p className="text-xs font-medium text-muted-foreground">Live preview</p>
            <p className="mt-1 break-words font-semibold tabular-nums">{money(1_234 * 10 ** preference.currencyDigits + (preference.currencyDigits ? 5 * 10 ** (preference.currencyDigits - 1) : 0), preference)}</p>
            <p className="mt-1 text-sm text-muted-foreground">{dateLabel("2026-11-20", undefined, preference)}</p>
          </div>
          <p className="text-xs text-muted-foreground">The currency sets its standard decimal places and symbol placement. Locale and separator choices control grouping, decimal marks and date order.</p>
        </Card>
      </section>
      <section className="space-y-3"><h2 className="text-lg font-semibold">Manage</h2>
        <Rows rows={[
          { title: "Profiles", description: "Switch ledgers or personalise a profile.", icon: UsersRound, href: "#accounts" },
          { title: "Accounts", description: "Manage accounts and opening balances.", icon: Wallet, href: "#ledger-accounts" },
          { title: "Categories", description: "Manage expense and income categories.", icon: Tags, href: "#categories" },
          { title: "Data & backup", description: "Back up, import, export or clear data.", icon: Database, href: "#data" },
          { title: "Security", description: "Set a site password and optionally encrypt this browser’s data.", icon: LockKeyhole, href: "#security" },
          { title: "Privacy & storage", description: "See what is stored on this device.", icon: ShieldCheck, href: "#storage" },
          { title: "About & legal", description: "App information, privacy and licences.", icon: Info, href: "#about" },
          { title: "Replay app tour", description: "Take a quick look around Money Manager.", icon: CircleHelp, run: replayTour },
        ]} />
      </section>
      <ErrorText message={error} />
    </>}
    {route === "accounts" && <Profiles profiles={profiles} activeProfileId={activeProfileId} addProfile={addProfile} editProfile={updateProfile} switchProfile={switchProfile} />}
    {route === "ledger-accounts" && <LedgerAccounts data={data} commit={commit} onEditorChange={onAccountEditorChange} />}
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
        { title: "Privacy Policy", description: "Read the privacy notice.", icon: ShieldCheck, href: privacyLinks.en },
      ]} />
    </>}
    {route === "about" && <Rows rows={[
      { title: "About", description: "What the app does and release information.", icon: CircleHelp, run: () => setNote("about") },
      { title: "Privacy Policy", description: "How your information is handled.", icon: ShieldCheck, href: privacyLinks.en },
      { title: "Licenses", description: "Third-party licences and notices.", icon: Scale, href: "/licenses" },
    ]} />}
    {note && <Modal title={note === "about" ? "About Money Manager" : "Browser storage details"}
      description={note === "about" ? "Version 0.1.0" : "Profile names, avatar choices, transactions, categories, budgets, savings pots, money transfers and preferences are stored in this browser."} close={() => setNote(undefined)}>
      {note === "about" && <BrandLogo />}
      <p className="text-sm">{note === "about" ? "Track income, expenses, budgets and savings in a local ledger on this device." :
        "The site password is a local screen lock. If optional storage encryption is off, anyone with browser access can read the records in storage. When it is on, the browser keeps encrypted records and needs the password to open them. Keep downloaded backups in a private location."}</p>
      <Button variant="outline" onClick={() => setNote(undefined)}>Close</Button>
    </Modal>}
  </div>
}
