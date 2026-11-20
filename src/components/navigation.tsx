"use client"

import { useState } from "react"
import { Activity, Archive, ChartNoAxesColumnIncreasing, ChevronDown, Database, LayoutGrid, Menu as MenuIcon, Settings as SettingsIcon, ShieldCheck, UserRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { SettingsPage } from "@/components/settings"
import { cn } from "@/lib/utils"

export const navigation = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "activity", label: "Activity", icon: Activity },
  { id: "budgets", label: "Budgets", icon: ChartNoAxesColumnIncreasing },
  { id: "savings", label: "Savings", icon: Archive },
] as const
type ReportRoute = typeof navigation[number]["id"]
export type Route = ReportRoute | SettingsPage
export const settingsRoutes = ["settings", "categories", "data", "storage", "about"] as const

export function AccountMenu({ mobile = false, hrefPrefix = "" }: { mobile?: boolean; hrefPrefix?: string }) {
  return <DropdownMenu>
    <DropdownMenuTrigger asChild>{mobile ?
      <Button variant="outline" size="icon-lg" className="size-11 bg-card" aria-label="Personal account"><UserRound /></Button> :
      <Button variant="secondary" className="w-full justify-start px-2 lg:min-h-11" aria-label="Personal account">
        <span aria-hidden="true" className="grid size-7 shrink-0 place-items-center rounded-md bg-accent text-primary"><UserRound size={16} /></span>
        <span className="hidden flex-1 text-left xl:block">Personal account</span><ChevronDown className="hidden xl:block" />
      </Button>}
    </DropdownMenuTrigger>
    <DropdownMenuContent align={mobile ? "end" : "start"} side={mobile ? "bottom" : "top"} className="min-w-48">
      <DropdownMenuItem asChild><a href={`${hrefPrefix}#settings`}><SettingsIcon /> Settings</a></DropdownMenuItem>
      <DropdownMenuItem asChild><a href={`${hrefPrefix}#storage`}><ShieldCheck /> Privacy & storage</a></DropdownMenuItem>
      <DropdownMenuItem asChild><a href={`${hrefPrefix}#data`}><Database /> Data & backup</a></DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
}

export function Sidebar({ route, hrefPrefix = "" }: { route: Route; hrefPrefix?: string }) {
  const [expanded, setExpanded] = useState(false)
  const inSettings = settingsRoutes.some(item => item === route)
  const items = [...navigation, { id: "settings", label: "Settings", icon: SettingsIcon }]
  return <aside className="fixed inset-y-0 left-0 z-20 hidden w-[72px] flex-col border-r bg-sidebar p-3 md:flex xl:w-[246px]">
    <a href={`${hrefPrefix}#overview`} className="mx-3 mb-4 hidden border-b px-0 pt-4 pb-5 text-base font-semibold tracking-tight xl:block">Baran’s Money Manager</a>
    <div className="mb-4 xl:hidden">
      <Sheet open={expanded} onOpenChange={setExpanded}>
        <SheetTrigger asChild><Button variant="ghost" size="icon-lg" aria-label="Open navigation" className="size-11"><MenuIcon /></Button></SheetTrigger>
        <SheetContent side="left" className="w-64 bg-sidebar">
          <SheetHeader><SheetTitle>Baran’s Money Manager</SheetTitle><SheetDescription>Choose a section.</SheetDescription></SheetHeader>
          <nav aria-label="Expanded navigation" className="grid gap-1 px-4">
            {items.map(({ id, label, icon: Icon }) => <Button key={id} variant={(id === route || (id === "settings" && inSettings)) ? "secondary" : "ghost"} className="justify-start" asChild>
              <a href={`${hrefPrefix}#${id}`} onClick={() => setExpanded(false)} aria-current={id === route ? "page" : undefined}><Icon /> {label}</a>
            </Button>)}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
    <nav className="grid gap-1" aria-label="Main navigation">
      {items.map(({ id, label, icon: Icon }) => {
        const current = route === id || (id === "settings" && inSettings)
        return <div key={id}>
          {id === "settings" && <p className="mx-3 mt-4 mb-2 hidden border-t pt-4 text-xs text-muted-foreground xl:block">Manage</p>}
          <Tooltip>
            <TooltipTrigger asChild><Button variant={current ? "secondary" : "ghost"} asChild
              className={cn("h-11 w-full justify-center px-0 xl:justify-start xl:px-3", current && "font-semibold text-primary")}>
              <a href={`${hrefPrefix}#${id}`} aria-label={label} aria-current={current ? "page" : undefined}>
                <Icon /><span className="hidden xl:inline">{label}</span>
                {current && <span className="ml-auto hidden h-2 w-1 rounded-full bg-primary xl:inline" />}
              </a>
            </Button></TooltipTrigger>
            <TooltipContent side="right" className="xl:hidden">{label}</TooltipContent>
          </Tooltip>
        </div>
      })}
    </nav>
    <div className="mt-auto border-t pt-4"><AccountMenu hrefPrefix={hrefPrefix} /></div>
  </aside>
}
