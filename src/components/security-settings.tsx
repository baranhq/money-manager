"use client"

import { useState } from "react"
import { LockKeyhole, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ErrorText, Field, FormActions, Modal, useOperation } from "@/components/shared"
import { removeSitePassword, setLocalStorageEncryption, setupSitePassword } from "@/lib/storage"

type Action = "setup" | "encrypt" | "decrypt" | "remove"
export type SecurityStatus = { configured: boolean; storageEncrypted: boolean }

export function SecuritySettings({ status, onChanged, onLock }: {
  status: SecurityStatus
  onChanged: () => Promise<void>
  onLock: () => void
}) {
  const [action, setAction] = useState<Action>()
  const [encryptOnSetup, setEncryptOnSetup] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmation, setConfirmation] = useState("")
  const cancel = () => {
    setAction(undefined)
    setPassword("")
    setConfirmation("")
    setEncryptOnSetup(false)
  }
  const operation = useOperation(cancel)

  async function save() {
    if (action === "setup") {
      if (password !== confirmation) throw new Error("The passwords do not match.")
      await setupSitePassword(password, encryptOnSetup)
    } else if (action === "encrypt") await setLocalStorageEncryption(password, true)
    else if (action === "decrypt") await setLocalStorageEncryption(password, false)
    else if (action === "remove") await removeSitePassword(password)
    await onChanged()
  }

  const actionCopy = {
    setup: {
      title: "Set a site password",
      description: "This password is checked in this browser. There is no password reset: encrypted records cannot be recovered without it, and clearing site data to remove a lock-only password also deletes the records.",
      label: "Set password",
    },
    encrypt: {
      title: "Encrypt local storage",
      description: "Download a backup to a private place first. If you forget this password, Money Manager cannot recover encrypted browser data.",
      label: "Encrypt stored data",
    },
    decrypt: {
      title: "Turn off storage encryption",
      description: "Your profiles and records will be decrypted back into this browser. The site will still ask for its password when opened.",
      label: "Decrypt stored data",
    },
    remove: {
      title: "Remove site password",
      description: status.storageEncrypted
        ? "This removes the site password and decrypts all local records in this browser. Anyone with browser access can then read them."
        : "This removes the app lock. Financial data remains in this browser’s storage without encryption.",
      label: "Remove password",
    },
  } satisfies Record<Action, { title: string; description: string; label: string }>

  return <div className="max-w-3xl space-y-4">
    <Card className="gap-4 p-5 shadow-none">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent text-primary"><ShieldCheck size={19} aria-hidden="true" /></span>
        <div className="space-y-1">
          <h2 className="font-semibold">{status.configured ? "Site password is on" : "No site password"}</h2>
          <p className="text-sm text-muted-foreground">The app asks for this password when opened in this browser. It is a local screen lock, not an online account.</p>
        </div>
      </div>
      <div className="rounded-lg border p-3">
        <div className="flex items-center gap-2 text-sm font-medium"><LockKeyhole size={16} aria-hidden="true" />Local storage</div>
        <p className="mt-1 text-sm text-muted-foreground">{status.storageEncrypted
          ? "Encrypted in this browser. The app decrypts it after you unlock."
          : "Not encrypted. A person with access to this browser profile can read the stored records."}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {status.configured ? <>
          <Button variant="outline" onClick={onLock}><LockKeyhole /> Lock this site now</Button>
          <Button variant="outline" onClick={() => setAction(status.storageEncrypted ? "decrypt" : "encrypt")}>
            {status.storageEncrypted ? "Turn off storage encryption" : "Encrypt local storage"}
          </Button>
          <Button variant="ghost" onClick={() => setAction("remove")}>Remove site password</Button>
        </> : <Button onClick={() => setAction("setup")}><LockKeyhole /> Set site password</Button>}
      </div>
    </Card>
    <p className="text-sm text-muted-foreground">The password screen protects casual access to the app. It cannot protect records from someone who can inspect or change this browser profile or the app itself. There is no password reset. Clearing site data removes a lock-only password but also deletes local records.</p>
    <p className="text-sm text-muted-foreground">If you open the app over plain HTTP on a network IP, someone who can change that network traffic could replace the page or capture your password. Use HTTPS before relying on password protection.</p>

    {action && <Modal title={actionCopy[action].title} description={actionCopy[action].description} close={cancel} busy={operation.busy}>
      <form className="grid gap-4" onSubmit={event => { event.preventDefault(); void operation.run(save) }}>
        {action === "setup" && <>
          <Field name="password" label="New password · at least 12 characters" type="password" value={password}
            onChange={event => setPassword(event.target.value)} autoComplete="new-password" minLength={12} maxLength={128} required />
          <Field name="confirmation" label="Confirm password" type="password" value={confirmation}
            onChange={event => setConfirmation(event.target.value)} autoComplete="new-password" minLength={12} maxLength={128} required />
          <label className="flex items-start gap-3 rounded-lg border p-3 text-sm">
            <input type="checkbox" checked={encryptOnSetup} onChange={event => setEncryptOnSetup(event.target.checked)} className="mt-0.5 size-4 accent-primary" />
            <span><span className="font-medium">Also encrypt this browser’s stored data</span>
              <span className="mt-1 block text-muted-foreground">If you lose the password, encrypted records cannot be recovered without it.</span></span>
          </label>
        </>}
        {action !== "setup" && <Field name="password" label="Current site password" type="password" value={password}
          onChange={event => setPassword(event.target.value)} autoComplete="current-password" minLength={12} maxLength={128} required />}
        <ErrorText message={operation.error} />
        <FormActions label={actionCopy[action].label} busy={operation.busy} cancel={cancel} disabled={password.length < 12 || (action === "setup" && confirmation.length < 12)} />
      </form>
    </Modal>}
  </div>
}
