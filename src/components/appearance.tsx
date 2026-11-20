"use client"

import { useEffect } from "react"
import { defaultPreferences } from "@/lib/finance"
import { readPreferences } from "@/lib/storage"

export function Appearance() {
  useEffect(() => {
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)")
    let active = true
    let read = 0
    let preferences = defaultPreferences

    function apply() {
      const { theme, reducedMotion } = preferences
      document.documentElement.classList.toggle("dark", theme === "dark" || (theme === "system" && systemDark.matches))
      if (reducedMotion === null) delete document.documentElement.dataset.reduced
      else document.documentElement.dataset.reduced = String(reducedMotion)
    }

    async function refresh() {
      const version = ++read
      try {
        const saved = await readPreferences()
        if (active && version === read) { preferences = saved; apply() }
      } catch { /* Use the default appearance if local storage is inaccessible. */ }
    }

    const channel = typeof BroadcastChannel === "function" ? new BroadcastChannel("money-manager-updates") : undefined
    channel?.addEventListener("message", refresh)
    systemDark.addEventListener("change", apply)
    window.addEventListener("money-manager-preferences", refresh)
    void refresh()
    return () => {
      active = false
      channel?.close()
      systemDark.removeEventListener("change", apply)
      window.removeEventListener("money-manager-preferences", refresh)
    }
  }, [])
  return null
}
