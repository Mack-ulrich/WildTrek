"use client"

import { useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Search } from "lucide-react"
import { SPECIES, KIND_LABELS, MONTHS_SHORT } from "@/data/species"
import { SpeciesTile } from "@/components/tiles"
import { MonthLegend } from "@/components/bits"
import type { Species } from "@/lib/types"
import { cn } from "@/utils"

const KINDS = Object.keys(KIND_LABELS).filter((k) => SPECIES.some((s) => s.kind === k)) as Species["kind"][]

export function SpeciesIndex() {
  const sp = useSearchParams()
  const [kind, setKind] = useState<Species["kind"] | "all">((sp.get("kind") as Species["kind"]) ?? "all")
  const [activity, setActivity] = useState<"all" | "fishing" | "hunting">((sp.get("activity") as "fishing" | "hunting") ?? "all")
  const [q, setQ] = useState("")
  const [inSeason, setInSeason] = useState(false)
  const month = new Date().getMonth()

  const list = useMemo(() => {
    const n = q.trim().toLowerCase()
    return SPECIES.filter((s) => {
      if (activity !== "all" && s.activity !== activity) return false
      if (kind !== "all" && s.kind !== kind) return false
      if (inSeason && s.months[month] < 2) return false
      if (n && ![s.name, s.scientific, ...s.aka].join(" ").toLowerCase().includes(n)) return false
      return true
    })
  }, [kind, activity, q, inSeason, month])

  return (
    <div>
      <div className="mb-6 space-y-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <label className="flex flex-1 items-center gap-2 rounded-xl bg-stone-50 px-3 py-2.5">
            <Search className="h-4 w-4 text-stone-500" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or nickname: specks, bull red, gobbler…" className="w-full bg-transparent text-sm outline-none" />
          </label>
          <div className="flex rounded-xl bg-stone-100 p-1">
            {(["all", "fishing", "hunting"] as const).map((a) => (
              <button key={a} onClick={() => { setActivity(a); setKind("all") }} className={cn("rounded-lg px-3 py-1.5 text-sm font-medium capitalize", activity === a ? "bg-white shadow-sm" : "text-stone-600")}>{a === "all" ? "All" : a}</button>
            ))}
          </div>
          <label className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50">
            <input type="checkbox" checked={inSeason} onChange={(e) => setInSeason(e.target.checked)} className="h-4 w-4 accent-orange-600" />
            Prime in {MONTHS_SHORT[month]}
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          <Kind active={kind === "all"} onClick={() => setKind("all")}>All types</Kind>
          {KINDS.filter((k) => activity === "all" || SPECIES.some((s) => s.kind === k && s.activity === activity)).map((k) => (
            <Kind key={k} active={kind === k} onClick={() => setKind(k)}>{KIND_LABELS[k]}</Kind>
          ))}
        </div>
      </div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-stone-600"><span className="font-semibold text-stone-900">{list.length}</span> species</p>
        <MonthLegend />
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {list.map((s, i) => <SpeciesTile key={s.slug} s={s} index={i} />)}
      </div>
      {list.length === 0 && <p className="py-16 text-center text-stone-500">No species match. Try clearing a filter.</p>}
    </div>
  )
}

function Kind({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button onClick={onClick} className={cn("rounded-full px-3 py-1 text-sm font-medium", active ? "bg-emerald-800 text-white" : "bg-stone-100 text-stone-700 hover:bg-stone-200")}>{children}</button>
}
