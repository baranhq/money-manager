"use client"

import { useId, useLayoutEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"

export const tourStops = [
  { route: "overview", title: "Your dashboard", copy: "See what’s available to spend and where your money went." },
  { route: "activity", title: "Log a transaction", copy: "Add what you spent or earned. It’ll show up in Activity." },
  { route: "settings", title: "Keep accounts separate", copy: "Use a name like Cash or Bank so you know where money moved." },
  { route: "budgets", title: "Give spending a limit", copy: "Pick a category and see how much you have left each month." },
  { route: "savings", title: "Set something aside", copy: "Give a goal its own pot and watch it grow." },
] as const

const statusKey = "money-manager:app-tour"
const fade = "motion-safe:full-motion:animate-in motion-safe:full-motion:fade-in motion-safe:full-motion:duration-150 motion-safe:full-motion:ease-out"

export function claimTourInvitation() {
  try {
    if (window.localStorage.getItem(statusKey)) return false
    window.localStorage.setItem(statusKey, "offered")
  } catch { /* The tour is still optional when browser storage is unavailable. */ }
  return true
}

export function saveTourResult(result: "completed" | "skipped") {
  try { window.localStorage.setItem(statusKey, result) }
  catch { /* Dismiss the current tour even when browser storage is unavailable. */ }
}

export function TourInvitation({ start, skip }: { start: () => void; skip: () => void }) {
  return <aside aria-label="App tour invitation"
    className={"fixed inset-x-4 bottom-[max(5.75rem,calc(env(safe-area-inset-bottom)+5rem))] z-50 rounded-xl border bg-card p-4 shadow-lg md:right-6 md:bottom-6 md:left-auto md:w-[21.5rem] " + fade}>
    <h2 className="text-lg font-semibold tracking-tight">Want a quick look?</h2>
    <p className="mt-1 text-sm text-muted-foreground">Five quick stops around Money Manager.</p>
    <div className="mt-3 flex flex-wrap justify-between gap-2">
      <Button variant="ghost" className="h-11 px-2 text-muted-foreground" onClick={skip}>Skip tour</Button>
      <Button className="h-11" onClick={start}>Take the tour</Button>
    </div>
  </aside>
}

type Spot = { left: number; top: number; width: number; height: number }
type Placement = { left: number; top: number; arrow?: { left: number; top: number }; spot?: Spot }

function locate(target: DOMRect | undefined, width: number, height: number, viewWidth: number, viewHeight: number): Placement {
  const edge = 16
  const gap = 16
  const mobile = viewWidth < 768
  const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), Math.max(min, max))
  const x = (value: number) => clamp(value, edge, viewWidth - width - edge)
  const y = (value: number) => clamp(value, edge, viewHeight - height - edge)
  if (!target || target.bottom <= 2 || target.top >= viewHeight - 2 || target.right <= 2 || target.left >= viewWidth - 2) {
    return { left: x((viewWidth - width) / 2), top: y(viewHeight - height - (mobile ? 92 : 32)) }
  }

  const leftEdge = Math.max(2, target.left - 4)
  const topEdge = Math.max(2, target.top - 4)
  const spot = {
    left: leftEdge, top: topEdge, width: Math.min(viewWidth - 2, target.right + 4) - leftEdge,
    height: Math.min(viewHeight - 2, target.bottom + 4) - topEdge,
  }
  const centerX = target.left + target.width / 2
  const centerY = target.top + target.height / 2

  if (!mobile) {
    const top = y(centerY - height / 2)
    const arrowY = clamp(centerY - top - 6, 12, height - 24)
    if (target.right + gap + width <= viewWidth - edge) {
      return { left: target.right + gap, top, arrow: { left: -6, top: arrowY }, spot }
    }
    if (target.left - gap - width >= edge) {
      return { left: target.left - gap - width, top, arrow: { left: width - 6, top: arrowY }, spot }
    }
  }

  const left = x(centerX - width / 2)
  const arrowX = clamp(centerX - left - 6, 12, width - 24)
  const above = target.top - gap - height
  const below = target.bottom + gap
  const bottomLimit = viewHeight - (mobile ? 84 : edge)
  if (below + height <= bottomLimit) return { left, top: below, arrow: { left: arrowX, top: -6 }, spot }
  if (above >= edge) return { left, top: above, arrow: { left: arrowX, top: height - 6 }, spot }
  return { left, top: y(viewHeight - height - (mobile ? 92 : 24)), spot }
}

export function AppTour({ index, move, finish }: {
  index: number
  move: (index: number) => void
  finish: (result: "completed" | "skipped") => void
}) {
  const stop = tourStops[index]
  const [placement, setPlacement] = useState<Placement>()
  const popup = useRef<HTMLElement>(null)
  const title = useRef<HTMLHeadingElement>(null)
  const labelId = useId()
  const descriptionId = useId()

  useLayoutEffect(() => {
    const tip = popup.current
    if (!tip) return
    let frame = 0
    let observed: Element | undefined
    let positioned = false

    function update() {
      frame = 0
      if (!tip) return
      const viewWidth = window.innerWidth
      const viewHeight = window.innerHeight
      const selector = '[data-tour-target="' + stop.route + '"]'
      const target = Array.from(document.querySelectorAll<HTMLElement>(selector)).find(node => {
        const rect = node.getBoundingClientRect()
        return rect.width > 0 && rect.height > 0 && getComputedStyle(node).visibility === "visible"
      })
      if (target !== observed) {
        if (observed) resize.unobserve(observed)
        if (target) resize.observe(target)
        observed = target
      }
      let rect = target?.getBoundingClientRect()
      if (!positioned && target && rect) {
        positioned = true
        const safeBottom = viewHeight - (viewWidth < 768 && stop.route !== "activity" ? 84 : 12)
        if (rect.top < 12 || rect.bottom > safeBottom) {
          target.scrollIntoView({ block: "center", inline: "nearest", behavior: "instant" })
          rect = target.getBoundingClientRect()
        }
      }
      const size = tip.getBoundingClientRect()
      const next = locate(rect, size.width, size.height, viewWidth, viewHeight)
      setPlacement(previous => JSON.stringify(previous) === JSON.stringify(next) ? previous : next)
    }

    function schedule() {
      if (!frame) frame = window.requestAnimationFrame(update)
    }

    const resize = new ResizeObserver(schedule)
    const mutations = new MutationObserver(schedule)
    resize.observe(tip)
    mutations.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-tour-target", "hidden"] })
    window.addEventListener("resize", schedule)
    window.addEventListener("scroll", schedule, { passive: true, capture: true })
    update()
    return () => {
      resize.disconnect()
      mutations.disconnect()
      window.removeEventListener("resize", schedule)
      window.removeEventListener("scroll", schedule, true)
      window.cancelAnimationFrame(frame)
    }
  }, [stop.route])

  useLayoutEffect(() => {
    if (placement) title.current?.focus({ preventScroll: true })
  }, [Boolean(placement)])

  const last = index === tourStops.length - 1
  return <>
    {placement?.spot && <div aria-hidden="true" data-tour-spotlight=""
      className={"pointer-events-none fixed z-[60] rounded-xl border-2 border-primary " + fade}
      style={{ ...placement.spot, boxShadow: "0 0 0 150vmax rgb(0 0 0 / .30)" }} />}
    <section ref={popup} role="dialog" aria-modal={false} aria-labelledby={labelId} aria-describedby={descriptionId}
      onKeyDown={event => {
        if (event.key === "Escape") {
          event.stopPropagation()
          finish("skipped")
        }
      }}
      className={"fixed z-[61] w-[min(20.25rem,calc(100%-2rem))] " + (placement ? fade : "invisible")}
      style={{ left: placement?.left ?? 16, top: placement?.top ?? 16 }}>
      {placement?.arrow && <span aria-hidden="true" className="pointer-events-none absolute size-3 rotate-45 rounded-xs border bg-card" style={placement.arrow} />}
      <div className="relative max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain rounded-xl border bg-card p-4 shadow-lg">
        <p className="text-xs font-medium tabular-nums text-muted-foreground">{index + 1} of {tourStops.length}</p>
        <h2 id={labelId} ref={title} tabIndex={-1} className="mt-1.5 text-lg font-semibold tracking-tight outline-none">{stop.title}</h2>
        <p id={descriptionId} className="mt-1 text-sm leading-relaxed text-muted-foreground">{stop.copy}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button variant="ghost" className="-ml-2 h-11 px-2 text-muted-foreground" onClick={() => finish("skipped")}>Skip tour</Button>
          <Button variant="ghost" className="ml-auto h-11 px-2.5" disabled={index === 0} onClick={() => move(index - 1)}>Back</Button>
          <Button className="h-11" onClick={() => last ? finish("completed") : move(index + 1)}>{last ? "Done" : "Next"}</Button>
        </div>
      </div>
    </section>
  </>
}
