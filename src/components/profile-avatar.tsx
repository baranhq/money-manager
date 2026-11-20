"use client"

import { Briefcase, Building2, House, Landmark, Store, UserRound, UsersRound, Wallet, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Profile, ProfileColour, ProfileIcon } from "@/lib/finance"

const iconComponents = {
  user: UserRound,
  home: House,
  company: Building2,
  bank: Landmark,
  briefcase: Briefcase,
  wallet: Wallet,
  shop: Store,
  group: UsersRound,
} satisfies Record<ProfileIcon, LucideIcon>

const colourClasses = {
  green: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  blue: "bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-200",
  orange: "bg-orange-100 text-orange-950 dark:bg-orange-950 dark:text-orange-200",
  purple: "bg-violet-100 text-violet-950 dark:bg-violet-950 dark:text-violet-200",
  rose: "bg-rose-100 text-rose-950 dark:bg-rose-950 dark:text-rose-200",
  teal: "bg-teal-100 text-teal-950 dark:bg-teal-950 dark:text-teal-200",
  amber: "bg-amber-100 text-amber-950 dark:bg-amber-950 dark:text-amber-200",
  slate: "bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-slate-100",
} satisfies Record<ProfileColour, string>

const dimensions = { sm: "size-7", md: "size-9", lg: "size-12" } as const

export function ProfileAvatar({ profile, size = "md", className }: {
  profile: Profile; size?: keyof typeof dimensions; className?: string
}) {
  const Icon = iconComponents[profile.icon]
  return <span aria-hidden="true" className={cn("grid shrink-0 place-items-center rounded-full", dimensions[size], colourClasses[profile.colour], className)}>
    <Icon className={size === "lg" ? "size-6" : size === "md" ? "size-[18px]" : "size-4"} strokeWidth={1.8} />
  </span>
}

export const profileColourNames: Record<ProfileColour, string> = {
  green: "Green",
  blue: "Blue",
  orange: "Orange",
  purple: "Purple",
  rose: "Rose",
  teal: "Teal",
  amber: "Amber",
  slate: "Slate",
}

export const profileIconNames: Record<ProfileIcon, string> = {
  user: "Person",
  home: "Home",
  company: "Company building",
  bank: "Bank",
  briefcase: "Briefcase",
  wallet: "Wallet",
  shop: "Shop",
  group: "Group",
}

export { iconComponents }
