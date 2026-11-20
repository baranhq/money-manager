"use client"

import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react"
import { ArrowDownRight, ArrowUpRight, Briefcase, Bus, Ellipsis, Heart, House, ShoppingBag, Utensils, Wallet, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { dateLabel, money, percent, type Category, type Data, type Entry, type Preferences } from "@/lib/finance"

export type Commit = (change: (data: Data) => Data, message: string) => Promise<void>
export type Action = { label: string; run: () => void; destructive?: boolean }

export function Modal({ title, description, close, children, busy = false, beforeClose, initialFocus, destructive = false }: {
  title: string; description: string; close: () => void; children: ReactNode; busy?: boolean
  beforeClose?: () => boolean; initialFocus?: string; destructive?: boolean
}) {
  const returnFocus = useRef<HTMLElement | null>(null)
  useEffect(() => {
    if (!returnFocus.current && document.activeElement instanceof HTMLElement) returnFocus.current = document.activeElement
  }, [])
  const changeOpen = (open: boolean) => {
    if (!open && !busy && (beforeClose?.() ?? true)) close()
  }
  const onOpenAutoFocus = (event: Event) => {
    if (!returnFocus.current && document.activeElement instanceof HTMLElement) returnFocus.current = document.activeElement
    const field = initialFocus && document.getElementById(initialFocus)
    if (field) { event.preventDefault(); field.focus() }
  }
  const onCloseAutoFocus = (event: Event) => {
    event.preventDefault()
    if (document.querySelector('[role="dialog"], [role="alertdialog"]')) return
    if (returnFocus.current?.isConnected) returnFocus.current.focus()
    else document.getElementById("main-content")?.focus()
  }
  const className = "max-h-[90dvh] overflow-y-auto p-5 duration-200 max-md:inset-x-0 max-md:top-auto max-md:bottom-0 max-md:w-full max-md:max-w-none max-md:translate-x-0 max-md:translate-y-0 max-md:rounded-t-xl max-md:rounded-b-none max-md:pb-[max(1.25rem,env(safe-area-inset-bottom))] md:max-w-[520px] md:p-7"
  const contentProps = { className, onOpenAutoFocus, onCloseAutoFocus }
  return destructive ? (
    <AlertDialog open onOpenChange={changeOpen}>
      <AlertDialogContent {...contentProps}>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {children}
      </AlertDialogContent>
    </AlertDialog>
  ) : (
    <Dialog open onOpenChange={changeOpen}>
      <DialogContent {...contentProps} showCloseButton={!busy}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}

export function useOperation(close: () => void) {
  const locked = useRef(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  async function run(action: () => Promise<unknown>, finish = true) {
    if (locked.current) return
    locked.current = true
    setError("")
    setBusy(true)
    try {
      await action()
      if (finish) close()
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "The operation failed. Try again.")
    } finally {
      locked.current = false
      setBusy(false)
    }
  }
  return { busy, error, run }
}

export function FormActions({ label, busy, cancel, disabled = false, destructive = false }: {
  label: string; busy: boolean; cancel: () => void; disabled?: boolean; destructive?: boolean
}) {
  return <div className="flex flex-wrap justify-end gap-2 pt-1">
    <Button type="button" id="cancel-operation" variant="outline" className="max-md:min-h-11" onClick={cancel} disabled={busy}>Cancel</Button>
    <Button type="submit" className="max-md:min-h-11" variant={destructive ? "destructive" : "default"} disabled={busy || disabled}>{busy ? "Working…" : label}</Button>
  </div>
}

export function ErrorText({ message }: { message: string }) {
  return message ? <p role="alert" className="rounded-md border border-destructive/35 bg-destructive/5 p-3 text-sm text-destructive">{message}</p> : null
}

export function Field({ label, name, ...props }: React.ComponentProps<typeof Input> & { label: string; name: string }) {
  const id = useId()
  return <div className="grid min-w-0 gap-2"><Label htmlFor={id}>{label}</Label><Input id={id} name={name} {...props} /></div>
}

export function Choose({ label, value, onChange, options, placeholder, id: providedId, compact = false }: {
  label: string; value: string; onChange: (value: string) => void; options: readonly (readonly [string, string])[]
  placeholder?: string; id?: string; compact?: boolean
}) {
  const generatedId = useId()
  const id = providedId ?? generatedId
  return <div className="grid min-w-0 gap-2">
    {!compact && <Label htmlFor={id}>{label}</Label>}
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id={id} aria-label={compact ? label : undefined} className="w-full min-w-0 bg-card max-md:h-11">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>{options.map(([key, name]) => <SelectItem key={key} value={key}>{name}</SelectItem>)}</SelectContent>
    </Select>
  </div>
}

export function Menu({ label, actions }: { label: string; actions: Action[] }) {
  return <DropdownMenu>
    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="shrink-0 max-md:size-11" aria-label={label}><Ellipsis /></Button></DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="min-w-40">
      {actions.map(action => <div key={action.label}>
        {action.destructive && <DropdownMenuSeparator />}
        <DropdownMenuItem variant={action.destructive ? "destructive" : "default"} onSelect={action.run}>{action.label}</DropdownMenuItem>
      </div>)}
    </DropdownMenuContent>
  </DropdownMenu>
}

const categoryIcons = { wallet: Wallet, basket: ShoppingBag, utensils: Utensils, bus: Bus, home: House, heart: Heart, bolt: Zap, briefcase: Briefcase }
const categoryColours = {
  green: "bg-accent text-primary",
  orange: "bg-orange-100 text-orange-900 dark:bg-orange-950 dark:text-orange-200",
  blue: "bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-200",
  purple: "bg-violet-100 text-violet-900 dark:bg-violet-950 dark:text-violet-200",
  rose: "bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-200",
  grey: "bg-muted text-foreground",
}

export function CategoryIcon({ category }: { category?: Category }) {
  const Icon = category ? categoryIcons[category.icon] : Wallet
  return <span className={cn("grid size-8 shrink-0 place-items-center rounded-md", categoryColours[category?.colour ?? "green"])}><Icon size={16} aria-hidden="true" /></span>
}

export function Empty({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return <div className="grid justify-items-center gap-2 rounded-xl border border-dashed p-6 text-center">
    <p className="font-medium">{title}</p>
    <p className="max-w-sm text-sm text-muted-foreground">{children}</p>
    {action && <div className="pt-1">{action}</div>}
  </div>
}

export function Meter({ amount, target, label }: { amount: number; target: number; label: string }) {
  const value = Math.min(100, Math.max(0, percent(amount, target)))
  return <div className="h-1.5 overflow-hidden rounded-full bg-current/15" role="progressbar" aria-label={label} aria-valuenow={value}>
    <div className={cn("h-full rounded-full", amount > target && target > 0 ? "bg-destructive" : "bg-current/80")} style={{ width: `${value}%` }} />
  </div>
}

export function Signed({ entry, preferences }: { entry: Entry; preferences: Preferences }) {
  return <span className={cn("whitespace-nowrap font-semibold tabular-nums", entry.kind === "income" && "text-primary")}>
    {entry.kind === "income" ? "+" + money(entry.amount, preferences) : money(-entry.amount, preferences)}
  </span>
}

export function Metric({ label, value, detail, direction }: { label: string; value: string; detail?: string; direction?: "up" | "down" }) {
  return <div className="min-w-0 space-y-1.5 px-1 sm:px-4 first:sm:pl-0">
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground sm:text-sm">
      {direction === "up" && <ArrowUpRight size={15} className="text-primary" />}
      {direction === "down" && <ArrowDownRight size={15} className="text-destructive" />}
      {label}
    </div>
    <div className="break-words text-base leading-none font-semibold tracking-tight tabular-nums sm:text-[clamp(1.1rem,2.25vw,1.9rem)]">{value}</div>
    {detail && <p className="hidden text-xs text-muted-foreground sm:block">{detail}</p>}
  </div>
}

export function EntryCaption({ entry, category, preferences, showDate = false }: { entry: Entry; category?: Category; preferences: Preferences; showDate?: boolean }) {
  return <span className="flex min-w-0 items-center gap-2.5 text-left">
    <CategoryIcon category={category} />
    <span className="min-w-0"><span className="block truncate font-medium">{entry.name}</span>
      <span className="block truncate text-xs text-muted-foreground">{category?.name}{showDate && ` · ${dateLabel(entry.date, { day: "numeric", month: "short" }, preferences)}`}</span>
    </span>
  </span>
}

export function formValues(event: FormEvent<HTMLFormElement>) {
  event.preventDefault()
  const values = new FormData(event.currentTarget)
  return (name: string) => String(values.get(name) ?? "").trim()
}
