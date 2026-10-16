"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { HUNT_SEASONS, seasonStatus, fmtRange, parseDay } from "@/data/seasons"
import { cn } from "@/utils"

const GAME_FILTERS = ["All", "Deer", "Turkey", "Birds", "Waterfowl", "Other"] as const
const groupOf = (g: string) =>
  g.includes("Deer") ? "Deer" : g.includes("Turkey") ? "Turkey" : g === "Dove" || g === "Quail" || g === "Pheasant" ? "Birds" : g === "Ducks" || g === "Teal" || g === "Geese" ? "Waterfowl" : "Other"

/** Timeline from Sep 1 2026 to Jun 30 2027. */
const T0 = parseDay("2026-09-01").getTime()
const T1 = parseDay("2027-06-30").getTime()
const pct = (iso: string) => ((parseDay(iso).getTime() - T0) / (T1 - T0)) * 100
const MONTH_TICKS = ["2026-09-01", "2026-10-01", "2026-11-01", "2026-12-01", "2027-01-01", "2027-02-01", "2027-03-01", "2027-04-01", "2027-05-01", "2027-06-01"]

export function SeasonBoard({ compact = false }: { compact?: boolean }) {
  const [filter, setFilter] = useState<(typeof GAME_FILTERS)[number]>("All")
  const [today, setToday] = useState<Date | null>(null)
  useEffect(() => setToday(new Date()), [])

  const rows = useMemo(() => HUNT_SEASONS.filter((s) => filter === "All" || groupOf(s.game) === filter), [filter])
  const statuses = useMemo(() => (today ? HUNT_SEASONS.map((s) => ({ s, st: seasonStatus(s, today) })) : []), [today])
  const openNow = statuses.filter((x) => x.st.state === "open")
  const upcoming = statuses
    .filter((x) => x.st.state === "upcoming")
    .sort((a, b) => (a.st.state === "upcoming" && b.st.state === "upcoming" ? a.st.daysUntil - b.st.daysUntil : 0))
    .slice(0, compact ? 4 : 6)
  const todayPct = today ? ((today.getTime() - T0) / (T1 - T0)) * 100 : -1

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-900">
            <span className="relative flex h-2.5 w-2.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" /><span className="relative h-2.5 w-2.5 rounded-full bg-emerald-600" /></span>
            Open right now
          </p>
          <ul className="space-y-2">
            {!today && <li className="h-16 animate-pulse rounded-lg bg-emerald-100" />}
            {today && openNow.length === 0 && <li className="text-sm text-emerald-900/70">Nothing open today — check what's coming up.</li>}
            {openNow.slice(0, compact ? 5 : 20).map(({ s, st }) => st.state === "open" && (
              <li key={s.id} className="flex items-center justify-between gap-3 text-sm">
                <span>
                  <span className="font-semibold text-stone-900">{s.game}</span> <span className="text-stone-600">· {s.zone}</span>
                  <span className="block text-xs text-stone-500">{st.window.label}: {fmtRange(st.window)}</span>
                </span>
                <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-emerald-800">{st.daysLeft === 0 ? "Last day" : `${st.daysLeft}d left`}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5">
          <p className="mb-3 text-sm font-semibold text-orange-900">Coming up</p>
          <ul className="space-y-2">
            {!today && <li className="h-16 animate-pulse rounded-lg bg-orange-100" />}
            {upcoming.map(({ s, st }) => st.state === "upcoming" && (
              <li key={s.id} className="flex items-center justify-between gap-3 text-sm">
                <span>
                  <span className="font-semibold text-stone-900">{s.game}</span> <span className="text-stone-600">· {s.zone}</span>
                  <span className="block text-xs text-stone-500">{st.window.label}: {fmtRange(st.window)}</span>
                </span>
                <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-orange-800">in {st.daysUntil}d</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {!compact && (
        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm md:p-6">
          <div className="mb-4 flex flex-wrap gap-2">
            {GAME_FILTERS.map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={cn("rounded-full px-3 py-1.5 text-sm font-medium transition", filter === f ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-700 hover:bg-stone-200")}>{f}</button>
            ))}
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-[760px]">
              <div className="relative ml-[220px] h-6 border-b border-stone-200">
                {MONTH_TICKS.map((m) => (
                  <span key={m} className="absolute top-0 text-[11px] font-semibold text-stone-500" style={{ left: `${pct(m)}%` }}>
                    {parseDay(m).toLocaleDateString("en-US", { month: "short" })}
                  </span>
                ))}
              </div>
              <div className="relative">
                {todayPct >= 0 && todayPct <= 100 && (
                  <div className="pointer-events-none absolute bottom-0 top-0 z-10 ml-[220px] w-[calc(100%-220px)]">
                    <div className="absolute bottom-0 top-0 w-0.5 bg-orange-600" style={{ left: `${todayPct}%` }}>
                      <span className="absolute -top-1 left-1 rounded bg-orange-600 px-1 text-[9px] font-bold text-white">TODAY</span>
                    </div>
                  </div>
                )}
                {rows.map((s) => (
                  <div key={s.id} className="flex items-center border-b border-stone-100 py-1.5 last:border-0">
                    <div className="w-[220px] shrink-0 pr-3">
                      {s.speciesSlug ? (
                        <Link href={`/species/${s.speciesSlug}`} className="text-sm font-semibold text-stone-900 hover:text-emerald-800">{s.game}</Link>
                      ) : (
                        <span className="text-sm font-semibold text-stone-900">{s.game}</span>
                      )}
                      <span className="block truncate text-[11px] text-stone-500">{s.zone} · {s.type}</span>
                    </div>
                    <div className="relative h-6 flex-1">
                      {MONTH_TICKS.map((m) => <span key={m} className="absolute bottom-0 top-0 w-px bg-stone-100" style={{ left: `${pct(m)}%` }} />)}
                      {s.windows.map((w) => {
                        const a = Math.max(0, pct(w.start))
                        const b = Math.min(100, pct(w.end) + 0.35)
                        if (b <= 0 || a >= 100) return null
                        const special = /youth|archery|early|teal|special|muzzle/i.test(w.label)
                        return (
                          <span
                            key={w.label + w.start}
                            title={`${w.label}: ${fmtRange(w)}`}
                            className={cn("absolute top-1 h-4 rounded", special ? "bg-amber-400" : "bg-emerald-700")}
                            style={{ left: `${a}%`, width: `${Math.max(0.6, b - a)}%` }}
                          />
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-stone-600">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-5 rounded bg-emerald-700" />General / regular</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-5 rounded bg-amber-400" />Archery, youth, special & early</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-0.5 bg-orange-600" />Today</span>
          </div>
        </div>
      )}
    </div>
  )
}
