"use client"

import { useMemo, useState } from "react"
import { Plus, Trash2, Trophy, Fish, Crosshair, Download, X } from "lucide-react"
import { SPECIES, SPECIES_BY_SLUG } from "@/data/species"
import { LOCATIONS } from "@/data/locations"
import { uid } from "@/lib/use-local"
import { useSynced } from "@/lib/use-synced"
import { logbookStore } from "@/lib/sync-stores"
import { moonPhaseName } from "@/lib/solunar"
import { cn } from "@/utils"

export interface LogEntry {
  id: string
  date: string
  species: string
  location: string
  length?: number
  weight?: number
  count: number
  kept: boolean
  method: string
  notes: string
  moon: string
}

const blank = () => ({
  date: new Date().toLocaleDateString("en-CA"),
  species: "red-drum",
  location: "port-aransas",
  length: "",
  weight: "",
  count: "1",
  kept: false,
  method: "",
  notes: "",
})

export function Logbook() {
  const [entries, setEntries, ready] = useSynced(logbookStore)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(blank())
  const [filter, setFilter] = useState<"all" | "fishing" | "hunting">("all")

  const visible = entries.filter((e) => filter === "all" || SPECIES_BY_SLUG[e.species]?.activity === filter)

  const stats = useMemo(() => {
    const total = entries.reduce((s, e) => s + e.count, 0)
    const days = new Set(entries.map((e) => e.date)).size
    const bySpecies = new Map<string, number>()
    entries.forEach((e) => bySpecies.set(e.species, (bySpecies.get(e.species) ?? 0) + e.count))
    const top = [...bySpecies.entries()].sort((a, b) => b[1] - a[1])[0]
    const pbs = new Map<string, LogEntry>()
    entries.forEach((e) => {
      const cur = pbs.get(e.species)
      const v = e.weight ?? e.length ?? 0
      if (v && (!cur || v > (cur.weight ?? cur.length ?? 0))) pbs.set(e.species, e)
    })
    const moonCounts = new Map<string, number>()
    entries.forEach((e) => moonCounts.set(e.moon, (moonCounts.get(e.moon) ?? 0) + e.count))
    const bestMoon = [...moonCounts.entries()].sort((a, b) => b[1] - a[1])[0]
    return { total, days, top, pbs: [...pbs.values()], bestMoon }
  }, [entries])

  const save = (e: React.FormEvent) => {
    e.preventDefault()
    const entry: LogEntry = {
      id: uid(),
      date: form.date,
      species: form.species,
      location: form.location,
      length: form.length ? Number(form.length) : undefined,
      weight: form.weight ? Number(form.weight) : undefined,
      count: Math.max(1, Number(form.count) || 1),
      kept: form.kept,
      method: form.method.trim(),
      notes: form.notes.trim(),
      moon: moonPhaseName(new Date(form.date + "T18:00:00Z")),
    }
    setEntries((prev) => [entry, ...prev].sort((a, b) => b.date.localeCompare(a.date)))
    setForm(blank())
    setOpen(false)
  }

  const exportCsv = () => {
    const head = "date,species,location,count,length_in,weight_lb,kept,method,moon,notes"
    const rows = entries.map((e) =>
      [e.date, SPECIES_BY_SLUG[e.species]?.name ?? e.species, LOCATIONS.find((l) => l.slug === e.location)?.name ?? e.location, e.count, e.length ?? "", e.weight ?? "", e.kept ? "yes" : "no", e.method, e.moon, e.notes]
        .map((v) => `"${String(v).replaceAll('"', '""')}"`).join(","),
    )
    const blob = new Blob([[head, ...rows].join("\n")], { type: "text/csv" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = "wildtrek-logbook.csv"
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const isHunt = SPECIES_BY_SLUG[form.species]?.activity === "hunting"

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Total logged" value={stats.total} />
        <StatCard label="Days afield" value={stats.days} />
        <StatCard label="Top species" value={stats.top ? SPECIES_BY_SLUG[stats.top[0]]?.name ?? "—" : "—"} small />
        <StatCard label="Luckiest moon" value={stats.bestMoon?.[0] ?? "—"} small />
      </div>

      {stats.pbs.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="mb-3 flex items-center gap-2 font-display text-xl font-bold text-amber-900"><Trophy className="h-5 w-5" />Personal bests</p>
          <div className="flex flex-wrap gap-3">
            {stats.pbs.map((e) => (
              <div key={e.id} className="rounded-xl bg-white px-4 py-2 shadow-sm">
                <p className="text-sm font-semibold">{SPECIES_BY_SLUG[e.species]?.name}</p>
                <p className="text-xs text-stone-600">{[e.weight && `${e.weight} lb`, e.length && `${e.length}"`].filter(Boolean).join(" · ")} · {new Date(e.date + "T12:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex rounded-xl bg-stone-100 p-1">
          {(["all", "fishing", "hunting"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={cn("rounded-lg px-3 py-1.5 text-sm font-medium capitalize", filter === f ? "bg-white shadow-sm" : "text-stone-600")}>{f}</button>
          ))}
        </div>
        <div className="flex gap-2">
          {entries.length > 0 && <button onClick={exportCsv} className="flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm font-medium hover:bg-stone-50"><Download className="h-4 w-4" />Export CSV</button>}
          <button onClick={() => setOpen(true)} className="flex items-center gap-1.5 rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"><Plus className="h-4 w-4" />Log a catch or harvest</button>
        </div>
      </div>

      {open && (
        <form onSubmit={save} className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold">New entry</h3>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close"><X className="h-5 w-5 text-stone-500" /></button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <L label="Date"><input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="inp" /></L>
            <L label="Species">
              <select value={form.species} onChange={(e) => setForm({ ...form, species: e.target.value })} className="inp">
                <optgroup label="Fish">{SPECIES.filter((s) => s.activity === "fishing").map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}</optgroup>
                <optgroup label="Game">{SPECIES.filter((s) => s.activity === "hunting").map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}</optgroup>
              </select>
            </L>
            <L label="Spot">
              <select value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="inp">
                {LOCATIONS.map((l) => <option key={l.slug} value={l.slug}>{l.name}</option>)}
                <option value="other">Somewhere else</option>
              </select>
            </L>
            <L label="How many"><input type="number" min={1} value={form.count} onChange={(e) => setForm({ ...form, count: e.target.value })} className="inp" /></L>
            <L label={isHunt ? "Antler points / length (optional)" : "Length in inches (optional)"}><input type="number" step="0.25" min={0} value={form.length} onChange={(e) => setForm({ ...form, length: e.target.value })} className="inp" /></L>
            <L label="Weight in lb (optional)"><input type="number" step="0.1" min={0} value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} className="inp" /></L>
            <L label={isHunt ? "Weapon / method" : "Bait / lure"}><input value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })} placeholder={isHunt ? "e.g. .270 from box blind" : "e.g. gold spoon"} className="inp" /></L>
            <L label="Notes"><input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Tide, wind, what worked…" className="inp" /></L>
            <label className="flex items-center gap-2 self-end pb-2 text-sm font-medium">
              <input type="checkbox" checked={form.kept} onChange={(e) => setForm({ ...form, kept: e.target.checked })} className="h-4 w-4 accent-emerald-800" />
              {isHunt ? "Harvested & tagged" : "Kept (not released)"}
            </label>
          </div>
          <button className="rounded-xl bg-emerald-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-900">Save entry</button>
        </form>
      )}

      {ready && visible.length === 0 && !open && (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
          <p className="font-display text-2xl font-bold">Your logbook is empty</p>
          <p className="mt-1 text-sm text-stone-600">Log every catch and harvest to track personal bests and see which moon phases and spots produce for you.</p>
        </div>
      )}

      <div className="space-y-2">
        {visible.map((e) => {
          const sp = SPECIES_BY_SLUG[e.species]
          const Icon = sp?.activity === "hunting" ? Crosshair : Fish
          return (
            <div key={e.id} className="flex items-start gap-4 rounded-xl border border-stone-200 bg-white p-4">
              <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-full", sp?.activity === "hunting" ? "bg-orange-100 text-orange-700" : "bg-sky-100 text-sky-700")}><Icon className="h-5 w-5" /></span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-stone-900">
                  {e.count > 1 && `${e.count} × `}{sp?.name ?? e.species}
                  {(e.length || e.weight) && <span className="font-normal text-stone-600"> · {[e.length && `${e.length}${sp?.activity === "hunting" ? "" : '"'}`, e.weight && `${e.weight} lb`].filter(Boolean).join(" · ")}</span>}
                  <span className={cn("ml-2 rounded-full px-2 py-0.5 text-[11px] font-semibold", e.kept ? "bg-stone-100 text-stone-700" : "bg-emerald-100 text-emerald-800")}>{e.kept ? (sp?.activity === "hunting" ? "Tagged" : "Kept") : "Released"}</span>
                </p>
                <p className="text-sm text-stone-600">
                  {new Date(e.date + "T12:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })} · {LOCATIONS.find((l) => l.slug === e.location)?.name ?? "Other spot"} · {e.moon}
                </p>
                {(e.method || e.notes) && <p className="mt-1 text-sm text-stone-500">{[e.method, e.notes].filter(Boolean).join(" — ")}</p>}
              </div>
              <button onClick={() => { if (confirm("Delete this entry?")) setEntries((p) => p.filter((x) => x.id !== e.id)) }} className="text-stone-400 hover:text-red-600" aria-label="Delete entry"><Trash2 className="h-4 w-4" /></button>
            </div>
          )
        })}
      </div>

      <style>{`.inp{width:100%;border-radius:.5rem;border:1px solid #d6d3d1;background:#fff;padding:.5rem .75rem;font-size:.875rem}`}</style>
    </div>
  )
}

function L({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1 block text-xs font-semibold text-stone-700">{label}</span>{children}</label>
}

function StatCard({ label, value, small }: { label: string; value: string | number; small?: boolean }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">{label}</p>
      <p className={cn("mt-1 font-display font-bold text-stone-900", small ? "truncate text-2xl" : "text-4xl")}>{value}</p>
    </div>
  )
}
