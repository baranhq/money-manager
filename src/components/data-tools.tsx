"use client"

import { useEffect, useRef, useState } from "react"
import { Download, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DateField } from "@/components/date-field"
import { combineBackup, parseBackup, serialiseBackup } from "@/lib/backup"
import { exportCsv, importCsv } from "@/lib/csv"
import { initialData, money, shiftMonth, today, type Data } from "@/lib/finance"
import { Choose, ErrorText, Field, FormActions, Modal, formValues, useOperation, type Commit } from "@/components/shared"
import { decryptProtectedExport, encryptProtectedExport, MAX_PROTECTED_EXPORT_BYTES, protectedExportKind } from "@/lib/security"

export type DataTool = "backup" | "restore" | "import" | "export" | "clear"

function download(text: string, mediaType: string, name: string) {
  const address = URL.createObjectURL(new Blob([text], { type: mediaType }))
  const link = document.createElement("a")
  link.href = address
  link.download = name
  document.body.append(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(address), 1000)
}

const counts = ["entries", "accounts", "budgets", "goals", "contributions", "categories"] as const
const labels = { entries: "Transactions", accounts: "Accounts", budgets: "Budgets", goals: "Savings pots", contributions: "Money transfers", categories: "Categories" }

function Counts({ before, after }: { before: Data; after?: Data }) {
  return <dl className="divide-y rounded-lg border px-3">
    {counts.map(key => <div key={key} className="grid grid-cols-[1fr_auto] gap-2 py-2 text-sm">
      <dt>{labels[key]}</dt><dd className="tabular-nums">{before[key]?.length ?? 0}{after && <> <span aria-hidden="true">→</span><span className="sr-only"> becomes </span> {after[key]?.length ?? 0}</>}</dd>
    </div>)}
  </dl>
}

export function DataTools({ mode, data, commit, close, notify, recover, profileName, profileId }: {
  mode: DataTool; data: Data; commit: Commit; close: () => void; notify: (text: string) => void; recover?: (data?: Data) => Promise<void>
  profileName: string; profileId: string
}) {
  const operation = useOperation(close)
  const [file, setFile] = useState<File>()
  const [review, setReview] = useState<{ before: Data; incoming: Data; duplicates?: number; rows?: ReturnType<typeof importCsv>["entries"] }>()
  const [strategy, setStrategy] = useState(recover ? "replace" : "merge")
  const [typed, setTyped] = useState("")
  const [scope, setScope] = useState("month")
  const [month, setMonth] = useState(today().slice(0, 7))
  const [confirmation, setConfirmation] = useState(mode === "clear")
  const [filePassword, setFilePassword] = useState("")
  const [passwordRequired, setPasswordRequired] = useState(false)
  const [protectCsv, setProtectCsv] = useState(false)
  const [exportPassword, setExportPassword] = useState("")
  const [exportPasswordConfirmation, setExportPasswordConfirmation] = useState("")
  const fileInput = useRef<HTMLInputElement>(null)
  const profileSlug = profileName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "profile"
  const fileProfile = profileId === "personal" ? profileSlug : `${profileSlug}-${profileId.slice(-6)}`
  useEffect(() => {
    if (confirmation) document.getElementById("cancel-operation")?.focus()
  }, [confirmation])
  const chooseFile = mode === "restore" || mode === "import"
  const title = {
    backup: "Download backup", restore: "Restore from backup", import: "Import CSV", export: "Export CSV", clear: "Clear local data?",
  }[mode]
  const disclaimer = "Downloaded files can contain financial records. Keep them private."
  const replace = strategy === "replace"
  let preview: Data | undefined
  let previewError = ""
  if (review) {
    if (mode === "restore" && !replace) {
      try { preview = combineBackup(review.before, review.incoming) } catch (error) { previewError = (error as Error).message }
    } else preview = review.incoming
  }

  async function analyse() {
    const selected = file
    if (!selected) throw new Error("Choose a file to review.")
    if (selected.size > MAX_PROTECTED_EXPORT_BYTES) throw new Error("Choose a file no larger than 12 MB.")
    const bytes = await selected.arrayBuffer()
    let text: string
    try { text = new TextDecoder("utf-8", { fatal: true }).decode(bytes) } catch {
      throw new Error("The file is not valid UTF-8 text.")
    }
    if (mode === "restore") {
      const kind = protectedExportKind(text)
      if (kind === "csv") throw new Error("Choose a protected JSON backup for restore. Protected CSV files belong in Import CSV.")
      if (kind === "backup") {
        if (!filePassword) { setPasswordRequired(true); return }
        text = await decryptProtectedExport(text, filePassword, "backup")
        setFilePassword("")
        setPasswordRequired(false)
      }
      setReview({ before: data, incoming: parseBackup(text) })
      return
    }
    const kind = protectedExportKind(text)
    if (kind === "backup") throw new Error("Choose a CSV export for transaction import, not a full JSON backup.")
    if (kind === "csv") {
      if (!filePassword) { setPasswordRequired(true); return }
      text = await decryptProtectedExport(text, filePassword, "csv")
      setFilePassword("")
      setPasswordRequired(false)
    }
    const result = importCsv(text, data)
    setReview({ before: data, incoming: { ...data, entries: [...data.entries, ...result.entries] }, duplicates: result.duplicates, rows: result.entries })
  }

  async function apply() {
    if (mode === "clear") {
      if (typed !== "CLEAR") throw new Error("Type CLEAR to continue.")
      if (recover) { await recover(); return }
      await commit(current => {
        if (JSON.stringify(current) !== JSON.stringify(data)) throw new Error("The local records changed. Reopen Clear local data to review the current counts.")
        return { ...initialData(), preferences: current.preferences }
      }, `Local records cleared for ${profileName}. Downloaded files remain where you saved them.`)
      return
    }
    if (!review || !preview) throw new Error("Review the file first.")
    if (mode === "restore" && replace && (!confirmation || typed !== "RESTORE")) throw new Error("Type RESTORE to continue.")
    if (recover) { await recover(preview); return }
    await commit(current => {
      if (JSON.stringify(current) !== JSON.stringify(review.before)) throw new Error("Local records changed. Choose the file again to refresh the preview.")
      return mode === "restore" && replace
        ? { ...preview, preferences: { ...current.preferences, currency: preview.preferences.currency, currencyDigits: preview.preferences.currencyDigits } }
        : preview
    }, mode === "restore" ? "Backup applied" : `${review.rows?.length ?? 0} transactions imported`)
  }

  function saveBackup() {
    download(serialiseBackup(data), "application/json", `money-manager-${fileProfile}-backup-${today()}.json`)
    notify("Backup downloaded")
  }

  async function saveProtectedBackup() {
    if (exportPassword !== exportPasswordConfirmation) throw new Error("The passwords do not match.")
    const protectedFile = await encryptProtectedExport(serialiseBackup(data), exportPassword, "backup")
    download(protectedFile, "application/json", `money-manager-${fileProfile}-backup-${today()}-protected.json`)
    setExportPassword("")
    setExportPasswordConfirmation("")
    notify("Password-protected backup downloaded")
  }

  const description = {
    backup: `Download the financial records for ${profileName}. The profile name and avatar remain in this browser. ${disclaimer}`,
    restore: `Choose a Money Manager JSON backup to merge into or replace the financial records for ${profileName}. Password-protected backups ask for their export password. The profile name and avatar are not changed.`,
    import: `Choose a Money Manager CSV or password-protected CSV export. Transactions will be checked before adding them to ${profileName}.`,
    export: `Download a CSV of ${profileName}'s transactions, with an option to protect it with a password. ${disclaimer}`,
    clear: `This removes transactions, budgets, savings pots, money transfers and custom categories from ${profileName}'s profile only. Its name and avatar stay. Appearance settings and downloaded files stay where they are.`,
  }[mode]

  return <Modal title={title} description={description} close={close} busy={operation.busy} initialFocus={mode === "clear" ? "cancel-operation" : undefined} destructive={mode === "clear"}>
    {mode === "backup" && <div className="space-y-4">
      <Counts before={data} />
      <Button onClick={() => void operation.run(async () => saveBackup())}><Download /> Download JSON backup</Button>
      <section className="grid gap-3 border-t pt-4">
        <div><h3 className="text-sm font-semibold">Password-protected copy</h3>
          <p className="mt-1 text-sm text-muted-foreground">Choose a password for this file. You’ll need it to restore the backup.</p></div>
        <Field name="protected-backup-password" label="Export password · at least 12 characters" type="password" value={exportPassword}
          onChange={event => setExportPassword(event.target.value)} autoComplete="new-password" minLength={12} maxLength={128} />
        <Field name="protected-backup-confirmation" label="Confirm export password" type="password" value={exportPasswordConfirmation}
          onChange={event => setExportPasswordConfirmation(event.target.value)} autoComplete="new-password" minLength={12} maxLength={128} />
        <Button className="justify-self-start" disabled={operation.busy || exportPassword.length < 12 || exportPassword !== exportPasswordConfirmation}
          onClick={() => void operation.run(saveProtectedBackup)}><Download /> Download protected backup</Button>
      </section>
    </div>}
    {chooseFile && <>
      <input ref={fileInput} type="file" accept={mode === "restore" ? ".json,application/json" : ".csv,.json,text/csv,application/json"} className="sr-only" tabIndex={-1} aria-label="Import file"
        onChange={event => {
          const selected = event.target.files?.[0]
          if (selected) { setFile(selected); setReview(undefined); setConfirmation(false); setTyped(""); setFilePassword(""); setPasswordRequired(false) }
          event.target.value = ""
        }} />
      <div className="flex items-center gap-2"><Button variant="outline" disabled={operation.busy} onClick={() => fileInput.current?.click()}><FileText /> Choose file</Button>
        <span className="min-w-0 truncate text-sm text-muted-foreground">{file?.name ?? "No file selected"}</span>
      </div>
      {passwordRequired && <Field name="protected-file-password" label="Password for this file" type="password" value={filePassword}
        onChange={event => setFilePassword(event.target.value)} autoComplete="current-password" maxLength={128} required />}
      {!review && <Button disabled={!file || operation.busy || (passwordRequired && !filePassword)} onClick={() => void operation.run(analyse, false)}>
        {operation.busy ? "Checking file…" : passwordRequired ? "Unlock and review file" : "Review file"}</Button>}
    </>}
    {review && <>
      {mode === "restore" && !recover && <Choose label="How should the backup be applied?" options={[["merge", "Merge with local records"], ["replace", "Replace local records"]]} value={strategy} onChange={value => { setStrategy(value); setConfirmation(false); setTyped("") }} />}
      {mode === "restore" && <p className="text-sm text-muted-foreground">Compatible backup · {review.incoming.preferences.currency}</p>}
      {preview && <section className="grid gap-2"><h3 className="text-sm font-semibold">{recover ? "Backup contents" : "Current → after changes"}</h3>
        <Counts before={recover ? preview : review.before} after={recover ? undefined : preview} /></section>}
      <ErrorText message={previewError} />
      {review.rows && <>
        <p className="text-sm">{review.rows.length} new · {review.duplicates} duplicate{review.duplicates === 1 ? "" : "s"} skipped</p>
        <p className="text-sm text-muted-foreground">
          Income {money(review.rows.reduce((sum, row) => sum + (row.kind === "income" ? row.amount : 0), 0), data.preferences)} ·
          Expenses {money(review.rows.reduce((sum, row) => sum + (row.kind === "expense" ? row.amount : 0), 0), data.preferences)}
        </p>
        {!review.rows.length && <p className="text-sm text-muted-foreground">No new transactions to import.</p>}
        {review.rows.length > 0 && <ul className="max-h-40 divide-y overflow-auto rounded-md border">
          {review.rows.slice(0, 12).map(row => <li key={row.id} className="px-3 py-2 text-sm">
            <p className="break-words font-medium">{row.name} · {money(row.amount, data.preferences)}</p>
            <p className="text-xs text-muted-foreground">{row.date} · {row.kind} · {data.categories.find(category => category.id === row.category)?.name} · {row.account}</p>
          </li>)}
        </ul>}
      </>}
      {mode === "restore" && replace && !confirmation
        ? <Button variant="destructive" disabled={!preview} onClick={() => setConfirmation(true)}>Continue to replacement</Button>
        : <form className="grid gap-3" onSubmit={event => { event.preventDefault(); void operation.run(apply) }}>
          {mode === "restore" && replace && <Field name="confirmation" label="Type RESTORE to replace the local records" value={typed} onChange={event => setTyped(event.target.value)} autoComplete="off" />}
          <FormActions busy={operation.busy} cancel={close}
            label={mode === "import" ? "Import transactions" : replace ? "Replace local records" : "Merge backup"}
            destructive={mode === "restore" && replace}
            disabled={!preview || review.rows?.length === 0 || (mode === "restore" && replace && typed !== "RESTORE")} />
        </form>}
    </>}
    {mode === "export" && <form className="grid gap-4" onSubmit={event => {
      const read = formValues(event)
      void operation.run(async () => {
        const start = scope === "custom" ? read("start") : month + "-01"
        const end = scope === "custom" ? read("end") : new Date(Date.parse(shiftMonth(month, 1) + "-01") - 86400000).toISOString().slice(0, 10)
        const csv = exportCsv(data, start, end)
        if (protectCsv) {
          if (exportPassword !== exportPasswordConfirmation) throw new Error("The passwords do not match.")
          const protectedFile = await encryptProtectedExport(csv, exportPassword, "csv")
          download(protectedFile, "application/json", `money-manager-${fileProfile}-transactions-${today()}-protected.json`)
          setExportPassword("")
          setExportPasswordConfirmation("")
          notify("Password-protected CSV downloaded")
        } else {
          download(csv, "text/csv;charset=utf-8", `money-manager-${fileProfile}-transactions-${today()}.csv`)
          notify("Transaction CSV downloaded")
        }
      })
    }}>
      <Choose label="Date range" options={[["month", "One month"], ["custom", "Custom range"]]} value={scope} onChange={setScope} />
      {scope === "custom" ? <div className="grid grid-cols-2 gap-3">
        <DateField name="start" label="From" preferences={data.preferences} required /><DateField name="end" label="To" preferences={data.preferences} required />
      </div> : <Field name="month" label="Month" type="month" value={month} onChange={event => setMonth(event.target.value)} required />}
      <label className="flex items-start gap-3 rounded-lg border p-3 text-sm">
        <input type="checkbox" checked={protectCsv} onChange={event => setProtectCsv(event.target.checked)} className="mt-0.5 size-4 accent-primary" />
        <span><span className="font-medium">Password-protect this CSV</span>
          <span className="mt-1 block text-muted-foreground">The downloaded file will need a password before it can be imported.</span></span>
      </label>
      {protectCsv && <>
        <Field name="csv-password" label="Export password · at least 12 characters" type="password" value={exportPassword}
          onChange={event => setExportPassword(event.target.value)} autoComplete="new-password" minLength={12} maxLength={128} required />
        <Field name="csv-password-confirmation" label="Confirm export password" type="password" value={exportPasswordConfirmation}
          onChange={event => setExportPasswordConfirmation(event.target.value)} autoComplete="new-password" minLength={12} maxLength={128} required />
      </>}
      {!data.entries.length && <p className="text-sm text-muted-foreground">Add a transaction before exporting.</p>}
      <FormActions label={protectCsv ? "Download protected CSV" : "Download CSV"} busy={operation.busy} cancel={close}
        disabled={!data.entries.length || (protectCsv && (exportPassword.length < 12 || exportPassword !== exportPasswordConfirmation))} />
    </form>}
    {mode === "clear" && <form className="grid gap-4" onSubmit={event => { event.preventDefault(); void operation.run(apply) }}>
      {!recover && <><Counts before={data} /><Card className="gap-2 p-3 shadow-none">
        <p className="text-sm text-muted-foreground">{disclaimer}</p>
        <Button type="button" variant="outline" size="sm" className="justify-self-start self-start" onClick={() => void operation.run(async () => saveBackup(), false)} disabled={operation.busy}><Download /> Download backup first</Button>
      </Card></>}
      <Field name="confirmation" label="Type CLEAR to confirm" value={typed} onChange={event => setTyped(event.target.value)} autoComplete="off" />
      <FormActions label="Clear local data" busy={operation.busy} cancel={close} disabled={typed !== "CLEAR"} destructive />
    </form>}
    <ErrorText message={operation.error} />
  </Modal>
}
