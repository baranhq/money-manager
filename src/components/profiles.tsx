"use client"

import { useState, type FormEvent } from "react"
import { Check, Pencil, Plus, UsersRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Field, FormActions, Modal } from "@/components/shared"
import { MAX_PROFILES, profileColours, profileIcons, type NewProfile, type Profile } from "@/lib/finance"
import { cn } from "@/lib/utils"
import { iconComponents, ProfileAvatar, profileColourNames, profileIconNames } from "@/components/profile-avatar"

function ProfileEditor({ profile, close, save }: {
  profile?: Profile; close: () => void; save: (value: NewProfile | Profile) => Promise<void>
}) {
  const [name, setName] = useState(profile?.name ?? "")
  const [colour, setColour] = useState<Profile["colour"]>(profile?.colour ?? "green")
  const [icon, setIcon] = useState<Profile["icon"]>(profile?.icon ?? "user")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const displayName = name.trim()
    if (!displayName) { setError("Enter a profile name."); return }
    setBusy(true)
    setError("")
    try {
      await save(profile ? { ...profile, name: displayName, colour, icon } : { name: displayName, colour, icon })
      close()
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "The profile could not be saved. Try again.")
    } finally { setBusy(false) }
  }

  const preview: Profile = { id: profile?.id ?? "preview", name: name.trim() || "Profile", colour, icon }
  return <Modal title={profile ? "Edit profile" : "Add a profile"}
    description="Choose a name, colour and avatar icon." close={close} busy={busy} initialFocus="profile-name">
    <form className="grid gap-5" onSubmit={event => void submit(event)}>
      <div className="flex items-center gap-3 rounded-lg bg-muted/60 p-3">
        <ProfileAvatar profile={preview} size="lg" />
        <span className="min-w-0"><span className="block text-xs text-muted-foreground">Preview</span>
          <span className="block truncate font-medium">{preview.name}</span></span>
      </div>
      <Field id="profile-name" label="Profile name" name="profile-name" value={name} maxLength={40} autoComplete="off"
        onChange={event => setName(event.target.value)} required />
      <fieldset className="grid gap-2">
        <legend className="text-sm font-medium">Avatar colour</legend>
        <div role="group" aria-label="Avatar colour" className="flex flex-wrap gap-2">
          {profileColours.map(value => <button key={value} type="button" aria-label={profileColourNames[value]} aria-pressed={colour === value}
            onClick={() => setColour(value)} className={cn("grid size-12 place-items-center rounded-full border-2 border-transparent p-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              colour === value && "border-primary")}>
            <ProfileAvatar profile={{ ...preview, colour: value }} size="md" />
          </button>)}
        </div>
      </fieldset>
      <fieldset className="grid gap-2">
        <legend className="text-sm font-medium">Avatar icon</legend>
        <div role="group" aria-label="Profile avatar icon" className="grid grid-cols-4 gap-2 sm:grid-cols-8">
          {profileIcons.map(value => {
            const Icon = iconComponents[value]
            return <button key={value} type="button" aria-label={`${profileIconNames[value]} icon`} aria-pressed={icon === value}
              onClick={() => setIcon(value)} className={cn("grid min-h-12 place-items-center rounded-lg border bg-card transition-colors hover:bg-accent/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                icon === value && "border-primary bg-accent/60")}>
              <Icon aria-hidden="true" size={20} strokeWidth={1.8} />
            </button>
          })}
        </div>
      </fieldset>
      {error && <p role="alert" className="rounded-md border border-destructive/35 bg-destructive/5 p-3 text-sm text-destructive">{error}</p>}
      <FormActions label={profile ? "Save changes" : "Add profile"} busy={busy} cancel={close} />
    </form>
  </Modal>
}

export function Profiles({ profiles, activeProfileId, addProfile, editProfile, switchProfile }: {
  profiles: Profile[]; activeProfileId: string; addProfile: (profile: NewProfile) => Promise<void>
  editProfile: (profile: Profile) => Promise<void>; switchProfile: (id: string) => Promise<void>
}) {
  const [editing, setEditing] = useState<Profile | "new">()
  const [busyId, setBusyId] = useState("")
  const [error, setError] = useState("")

  async function changeProfile(id: string) {
    setBusyId(id)
    setError("")
    try { await switchProfile(id) }
    catch (problem) { setError(problem instanceof Error ? problem.message : "The profile could not be opened.") }
    finally { setBusyId("") }
  }

  async function saveProfile(value: NewProfile | Profile) {
    if ("id" in value) await editProfile(value)
    else await addProfile(value)
  }

  return <div className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground"><UsersRound size={17} aria-hidden="true" />
        <span>{profiles.length} {profiles.length === 1 ? "profile" : "profiles"} on this browser</span>
      </div>
      <Button className="min-h-11" onClick={() => setEditing("new")} disabled={profiles.length >= MAX_PROFILES}>
        <Plus aria-hidden="true" /> Add profile
      </Button>
    </div>
    <ul className="divide-y rounded-xl border bg-card">
      {profiles.map(profile => {
        const active = profile.id === activeProfileId
        const busy = busyId === profile.id
        return <li key={profile.id} className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:px-4">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <ProfileAvatar profile={profile} size="md" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{profile.name}</p>
              <p className="text-sm text-muted-foreground">{active ? "Current profile" : "Separate local ledger"}</p>
            </div>
            {active && <span className="flex shrink-0 items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-primary"><Check size={13} aria-hidden="true" />Current</span>}
          </div>
          <div className="flex gap-2 sm:shrink-0">
            {!active && <Button variant="outline" className="min-h-11 flex-1 sm:flex-none" disabled={busy} onClick={() => void changeProfile(profile.id)}>
              {busy ? "Switching…" : "Switch"}
            </Button>}
            <Button variant="ghost" className="min-h-11 flex-1 sm:flex-none" aria-label={`Edit ${profile.name}`} onClick={() => setEditing(profile)}>
              <Pencil aria-hidden="true" /> Edit
            </Button>
          </div>
        </li>
      })}
    </ul>
    <aside className="rounded-lg bg-accent/55 p-4 text-sm leading-relaxed text-muted-foreground">
      Profiles keep separate transactions, categories, budgets, savings goals and preferences in this browser. They do not have passwords: anyone with access to this browser can switch between them.
    </aside>
    {error && <p role="alert" className="rounded-md border border-destructive/35 bg-destructive/5 p-3 text-sm text-destructive">{error}</p>}
    {editing && <ProfileEditor key={editing === "new" ? "new" : editing.id} profile={editing === "new" ? undefined : editing}
      close={() => setEditing(undefined)} save={saveProfile} />}
  </div>
}
