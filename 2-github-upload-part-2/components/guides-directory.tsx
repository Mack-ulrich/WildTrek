"use client"

import { useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { GUIDES, fromPrice } from "@/data/guides"
import { REGIONS } from "@/data/locations"
import { SPECIES, SPECIES_BY_SLUG } from "@/data/species"
import { GuideTile } from "@/components/tiles"
import type { Activity, RegionId } from "@/lib/types"
import { cn } from "@/utils"

const SORTS = { rating: "Top rated", reviews: "Most reviewed", price_asc: "Price: low to high", price_desc: "Price: high to low", experience: "Most experience" } as const

export function GuidesDirectory() {
  const sp = useSearchParams()
  const router = useRouter()
  const [q, setQ] = useState(sp.get("q") ?? "")
  const [activity, setActivity] = useState<Activity | "all">((sp.get("activity") as Activity) ?? "all")
  const [region, setRegion] = useState<RegionId | "all">((sp.get("region") as RegionId) ?? "all")
  const [species, setSpecies] = useState(sp.get("species") ?? "all")
  const [maxPrice, setMaxPrice] = useState(Number(sp.get("max") ?? 0))
  const [sort, setSort] = useState<keyof typeof SORTS>("rating")
  const [showFilters, setShowFilters] = useState(false)

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const list = GUIDES.filter((g) => {
      if (activity !== "all" && g.activity !== activity) return false
      if (region !== "all" && g.region !== region) return false
      if (species !== "all" && !g.species.includes(species)) return false
      if (maxPrice && fromPrice(g) > maxPrice) return false
      if (needle) {
        const hay = [g.name, g.business, g.homeBase, ...g.disciplines, ...g.species.map((s) => SPECIES_BY_SLUG[s]?.name ?? "")].join(" ").toLowerCase()
        if (!hay.includes(needle)) return false
      }
      return true
    })
    const by: Record<keyof typeof SORTS, (a: (typeof GUIDES)[0], b: (typeof GUIDES)[0]) => number> = {
      rating: (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount,
      reviews: (a, b) => b.reviewCount - a.reviewCount,
      price_asc: (a, b) => fromPrice(a) - fromPrice(b),
      price_desc: (a, b) => fromPrice(b) - fromPrice(a),
      experience: (a, b) => b.yearsExperience - a.yearsExperience,
    }
    return [...list].sort(by[sort])
  }, [q, activity, region, species, maxPrice, sort])

  const speciesOptions = SPECIES.filter((s) => activity === "all" || s.activity === activity || activity === "outdoors")
  const activeCount = [activity !== "all", region !== "all", species !== "all", maxPrice > 0].filter(Boolean).length
  const reset = () => { setActivity("all"); setRegion("all"); setSpecies("all"); setMaxPrice(0); setQ(""); router.replace("/guides") }

  const Filters = (
    <div className="space-y-6">
      <FilterGroup label="Activity">
        {(["all", "fishing", "hunting", "outdoors"] as const).map((a) => (
          <Pill key={a} active={activity === a} onClick={() => { setActivity(a); setSpecies("all") }}>{a === "all" ? "Everything" : a[0].toUpperCase() + a.slice(1)}</Pill>
        ))}
      </FilterGroup>
      <FilterGroup label="Region">
        <select value={region} onChange={(e) => setRegion(e.target.value as RegionId | "all")} className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm">
          <option value="all">All of Texas</option>
          {REGIONS.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
      </FilterGroup>
      <FilterGroup label="Target species">
        <select value={species} onChange={(e) => setSpecies(e.target.value)} className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm">
          <option value="all">Any species</option>
          {speciesOptions.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
        </select>
      </FilterGroup>
      <FilterGroup label={`Starting price${maxPrice ? ` up to $${maxPrice.toLocaleString()}` : ""}`}>
        <input type="range" min={0} max={3000} step={100} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full accent-emerald-800" />
        <div className="flex justify-between text-[11px] text-stone-500"><span>Any</span><span>$3,000</span></div>
      </FilterGroup>
      {activeCount > 0 && <button onClick={reset} className="text-sm font-semibold text-orange-700 hover:underline">Clear all filters</button>}
    </div>
  )

  return (
    <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
      <aside className="hidden lg:block"><div className="sticky top-24">{Filters}</div></aside>

      <div>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="flex flex-1 items-center gap-2 rounded-xl border border-stone-300 bg-white px-3 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-emerald-700">
            <Search className="h-4 w-4 text-stone-500" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search guides, towns, species, techniques…" className="w-full bg-transparent text-sm outline-none" />
            {q && <button onClick={() => setQ("")} aria-label="Clear search"><X className="h-4 w-4 text-stone-400" /></button>}
          </label>
          <div className="flex gap-2">
            <button onClick={() => setShowFilters((s) => !s)} className="flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm font-medium lg:hidden">
              <SlidersHorizontal className="h-4 w-4" />Filters{activeCount ? ` (${activeCount})` : ""}
            </button>
            <select value={sort} onChange={(e) => setSort(e.target.value as keyof typeof SORTS)} className="rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm">
              {Object.entries(SORTS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
        </div>
        {showFilters && <div className="mb-6 rounded-2xl border border-stone-200 bg-white p-4 lg:hidden">{Filters}</div>}

        <p className="mb-4 text-sm text-stone-600"><span className="font-semibold text-stone-900">{results.length}</span> guide{results.length === 1 ? "" : "s"} available</p>
        {results.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
            <p className="text-lg font-semibold text-stone-900">No guides match those filters</p>
            <p className="mt-1 text-sm text-stone-600">Try widening the region or price range.</p>
            <button onClick={reset} className="mt-4 rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white">Reset filters</button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((g, i) => <GuideTile key={g.id} guide={g} index={i} />)}
          </div>
        )}
      </div>
    </div>
  )
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-500">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={cn("rounded-full px-3 py-1.5 text-sm font-medium transition", active ? "bg-emerald-800 text-white" : "bg-white text-stone-700 ring-1 ring-stone-300 hover:ring-stone-400")}>
      {children}
    </button>
  )
}
