"use client"

import { useEffect } from "react"
import { defaultPreferences, type Theme } from "@/lib/finance"
import { readPreferences } from "@/lib/storage"

export function Appearance() {
  useEffect(() => {
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)")
    let active = true
    let read = 0
    let preferences = defaultPreferences
    let preview: Theme | undefined

    function apply() {
      const { reducedMotion } = preferences
      const theme = preview ?? preferences.theme
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

    function updatePreview(event: Event) {
      const theme: unknown = event instanceof CustomEvent ? event.detail : undefined
      preview = theme === "light" || theme === "dark" || theme === "system" ? theme : undefined
      if (preview) apply()
      else void refresh()
    }

    const channel = typeof BroadcastChannel === "function" ? new BroadcastChannel("money-manager-updates") : undefined
    channel?.addEventListener("message", refresh)
    systemDark.addEventListener("change", apply)
    window.addEventListener("money-manager-preferences", refresh)
    window.addEventListener("money-manager-theme-preview", updatePreview)
    void refresh()
    return () => {
      active = false
      channel?.close()
      systemDark.removeEventListener("change", apply)
      window.removeEventListener("money-manager-preferences", refresh)
      window.removeEventListener("money-manager-theme-preview", updatePreview)
    }
  }, [])
  return null
}
