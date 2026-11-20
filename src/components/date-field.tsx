"use client"

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react"
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { dateLabel, isDate, today, weekStart, type Preferences } from "@/lib/finance"

type DateFieldProps = {
  label: string
  name: string
  preferences: Preferences
  required?: boolean
  value?: string
  defaultValue?: string
  min?: string
  max?: string
  onChange?: (value: string) => void
}

function parseDate(value: string) {
  const [year, month, day] = value.split("-").map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

function dateKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`
}

function firstOfMonth(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1))
}

function shiftMonth(date: Date, amount: number) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + amount, 1))
}

function shiftDay(date: Date, amount: number) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + amount))
}

function shiftDateMonth(date: Date, amount: number) {
  const targetMonth = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + amount, 1))
  const lastDay = new Date(Date.UTC(targetMonth.getUTCFullYear(), targetMonth.getUTCMonth() + 1, 0)).getUTCDate()
  return new Date(Date.UTC(targetMonth.getUTCFullYear(), targetMonth.getUTCMonth(), Math.min(date.getUTCDate(), lastDay)))
}

function withinBounds(value: string, min?: string, max?: string) {
  if (min && value < min) return min
  if (max && value > max) return max
  return value
}

export function DateField({ label, name, preferences, required = false, value: controlledValue, defaultValue = "", min, max, onChange }: DateFieldProps) {
  const id = useId()
  const triggerId = `${id}-trigger`
  const errorId = `${id}-error`
  const titleId = `${id}-title`
  const dayRefs = useRef(new Map<string, HTMLButtonElement>())
  const validationRef = useRef<HTMLInputElement>(null)
  const [localValue, setLocalValue] = useState(defaultValue)
  const value = controlledValue ?? localValue
  const startingDate = withinBounds(isDate(value) ? value : today(), min, max)
  const [viewMonth, setViewMonth] = useState(() => firstOfMonth(parseDate(startingDate)))
  const [focusedDate, setFocusedDate] = useState(startingDate)
  const [open, setOpen] = useState(false)
  const [invalid, setInvalid] = useState(false)
  const [errorMessage, setErrorMessage] = useState("Choose a date.")

  useEffect(() => {
    const outsideRange = Boolean(value && ((min && value < min) || (max && value > max)))
    validationRef.current?.setCustomValidity(outsideRange ? "Choose a date inside the available range." : "")
  }, [max, min, value])

  useEffect(() => {
    if (!open) return
    const frame = window.requestAnimationFrame(() => dayRefs.current.get(focusedDate)?.focus())
    return () => window.cancelAnimationFrame(frame)
  }, [focusedDate, open, viewMonth])

  const selectedDate = isDate(value) ? value : ""
  const monthLabel = new Intl.DateTimeFormat(preferences.locale, { month: "long", year: "numeric", timeZone: "UTC" }).format(viewMonth)
  const first = firstOfMonth(viewMonth)
  const weekOffset = (first.getUTCDay() - weekStart(preferences.locale) + 7) % 7
  const gridStart = shiftDay(first, -weekOffset)
  const weekdayFormatter = new Intl.DateTimeFormat(preferences.locale, { weekday: "short", timeZone: "UTC" })
  const weekdayNames = Array.from({ length: 7 }, (_, index) => weekdayFormatter.format(new Date(Date.UTC(2024, 0, 7 + index))))
  const weekdays = [...weekdayNames.slice(weekStart(preferences.locale)), ...weekdayNames.slice(0, weekStart(preferences.locale))]
  const days = Array.from({ length: 42 }, (_, index) => shiftDay(gridStart, index))
  const previousMonth = shiftMonth(viewMonth, -1)
  const nextMonth = shiftMonth(viewMonth, 1)
  const lastDayInPreviousMonth = dateKey(new Date(Date.UTC(previousMonth.getUTCFullYear(), previousMonth.getUTCMonth() + 1, 0)))
  const canGoPrevious = !min || lastDayInPreviousMonth >= min
  const canGoNext = !max || dateKey(nextMonth) <= max
  const currentDay = today()

  function updateValue(next: string) {
    if (controlledValue === undefined) setLocalValue(next)
    onChange?.(next)
    setInvalid(false)
  }

  function openCalendar(nextOpen: boolean) {
    if (nextOpen) {
      const start = withinBounds(isDate(value) ? value : today(), min, max)
      setFocusedDate(start)
      setViewMonth(firstOfMonth(parseDate(start)))
    }
    setOpen(nextOpen)
  }

  function selectDate(date: Date) {
    const next = dateKey(date)
    if ((min && next < min) || (max && next > max)) return
    updateValue(next)
    setFocusedDate(next)
    setViewMonth(firstOfMonth(date))
    setOpen(false)
  }

  function focusDate(date: Date) {
    const next = dateKey(date)
    if ((min && next < min) || (max && next > max)) return
    setFocusedDate(next)
    setViewMonth(firstOfMonth(date))
  }

  function navigateMonth(amount: number) {
    const targetMonth = shiftMonth(viewMonth, amount)
    const currentFocus = parseDate(focusedDate)
    const lastDay = new Date(Date.UTC(targetMonth.getUTCFullYear(), targetMonth.getUTCMonth() + 1, 0)).getUTCDate()
    const targetDate = withinBounds(dateKey(new Date(Date.UTC(targetMonth.getUTCFullYear(), targetMonth.getUTCMonth(), Math.min(currentFocus.getUTCDate(), lastDay)))), min, max)
    setViewMonth(targetMonth)
    setFocusedDate(targetDate)
  }

  function handleDayKeyDown(event: KeyboardEvent<HTMLButtonElement>, date: Date) {
    let next: Date | undefined
    const dayOfWeek = (date.getUTCDay() - weekStart(preferences.locale) + 7) % 7
    if (event.key === "ArrowLeft") next = shiftDay(date, -1)
    else if (event.key === "ArrowRight") next = shiftDay(date, 1)
    else if (event.key === "ArrowUp") next = shiftDay(date, -7)
    else if (event.key === "ArrowDown") next = shiftDay(date, 7)
    else if (event.key === "Home") next = shiftDay(date, -dayOfWeek)
    else if (event.key === "End") next = shiftDay(date, 6 - dayOfWeek)
    else if (event.key === "PageUp") next = shiftDateMonth(date, event.shiftKey ? -12 : -1)
    else if (event.key === "PageDown") next = shiftDateMonth(date, event.shiftKey ? 12 : 1)
    if (!next) return
    event.preventDefault()
    focusDate(next)
  }

  return <div className="grid min-w-0 gap-2">
    <Label htmlFor={triggerId}>{label}</Label>
    <input type="hidden" name={name} value={value} />
    <input
      type="text"
      ref={validationRef}
      tabIndex={-1}
      aria-hidden="true"
      className="sr-only"
      required={required}
      value={value ? "selected" : ""}
      onChange={() => {}}
      onInvalid={event => {
        event.preventDefault()
        const outsideRange = Boolean(value && ((min && value < min) || (max && value > max)))
        setErrorMessage(outsideRange ? "Choose a date inside the available range." : "Choose a date.")
        setInvalid(true)
        document.getElementById(triggerId)?.focus()
      }}
    />
    <Popover open={open} onOpenChange={openCalendar}>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={triggerId}
          aria-haspopup="dialog"
          aria-controls={`${id}-calendar`}
          aria-expanded={open}
          aria-invalid={invalid || undefined}
          aria-required={required || undefined}
          aria-describedby={invalid ? errorId : undefined}
          className="flex h-9 w-full min-w-0 items-center justify-between gap-3 rounded-md border border-input bg-transparent px-3 py-1 text-left text-sm shadow-xs outline-none transition-[color,box-shadow] hover:bg-accent/40 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 max-md:h-11"
        >
          <span className={selectedDate ? "truncate" : "truncate text-muted-foreground"}>
            {selectedDate ? dateLabel(selectedDate, undefined, preferences) : "Choose a date"}
          </span>
          <CalendarDays aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        id={`${id}-calendar`}
        aria-labelledby={titleId}
        align="start"
        side="bottom"
        sideOffset={6}
        onOpenAutoFocus={event => event.preventDefault()}
        className="z-[60] w-80 max-w-[calc(100vw_-_1rem)] max-h-[calc(100dvh_-_1rem)] overflow-y-auto rounded-xl p-3 shadow-lg"
      >
        <h2 id={titleId} className="sr-only">Choose {label.toLocaleLowerCase()}</h2>
        <div className="mb-3 flex items-center justify-between gap-2">
          <Button type="button" variant="ghost" size="icon" className="size-9" aria-label="Previous month" disabled={!canGoPrevious}
            onClick={() => navigateMonth(-1)}>
            <ChevronLeft aria-hidden="true" />
          </Button>
          <p aria-live="polite" aria-atomic="true" className="min-w-0 text-center text-sm font-semibold">{monthLabel}</p>
          <Button type="button" variant="ghost" size="icon" className="size-9" aria-label="Next month" disabled={!canGoNext}
            onClick={() => navigateMonth(1)}>
            <ChevronRight aria-hidden="true" />
          </Button>
        </div>
        <div role="grid" aria-label={monthLabel} className="grid grid-cols-1">
          <div role="row" className="mb-1 grid grid-cols-7">
            {weekdays.map((day, index) => <div key={`${day}-${index}`} role="columnheader" className="flex h-8 items-center justify-center text-xs font-medium text-muted-foreground">{day}</div>)}
          </div>
          {Array.from({ length: 6 }, (_, week) => <div role="row" key={week} className="grid grid-cols-7">
            {days.slice(week * 7, week * 7 + 7).map(date => {
              const day = dateKey(date)
              const inMonth = date.getUTCMonth() === viewMonth.getUTCMonth()
              const isSelected = day === selectedDate
              const isToday = day === currentDay
              const disabled = Boolean((min && day < min) || (max && day > max))
              return <div role="gridcell" key={day} className="flex items-center justify-center p-0.5">
                <button
                  type="button"
                  ref={element => { if (element) dayRefs.current.set(day, element); else dayRefs.current.delete(day) }}
                  tabIndex={day === focusedDate ? 0 : -1}
                  aria-label={dateLabel(day, { weekday: "long", day: "numeric", month: "long", year: "numeric" }, preferences)}
                  aria-pressed={isSelected}
                  aria-current={isToday ? "date" : undefined}
                  disabled={disabled}
                  onClick={() => selectDate(date)}
                  onFocus={() => setFocusedDate(day)}
                  onKeyDown={event => handleDayKeyDown(event, date)}
                  className={`flex size-9 items-center justify-center rounded-md text-sm tabular-nums outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 max-md:size-10 ${
                    isSelected ? "bg-primary font-semibold text-primary-foreground hover:bg-primary/90" :
                    isToday ? "border border-primary font-semibold text-primary hover:bg-accent" :
                    "text-foreground hover:bg-accent"
                  } ${!inMonth && !isSelected ? "text-muted-foreground" : ""} ${disabled ? "cursor-not-allowed opacity-35" : ""}`}
                >
                  {date.getUTCDate()}
                </button>
              </div>
            })}
          </div>)}
        </div>
        <div className="mt-2 flex items-center justify-between border-t pt-2">
          <Button type="button" variant="ghost" size="sm" className="text-primary" disabled={Boolean((min && currentDay < min) || (max && currentDay > max))}
            onClick={() => selectDate(parseDate(currentDay))}>Today</Button>
          {!required && <Button type="button" variant="ghost" size="sm" onClick={() => { updateValue(""); setOpen(false) }}>Clear date</Button>}
        </div>
      </PopoverContent>
    </Popover>
    {invalid && <p id={errorId} role="alert" className="text-sm text-destructive">{errorMessage}</p>}
  </div>
}
