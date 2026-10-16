"use client"

import { useState } from "react"
import { Check, RotateCcw, Fish, Crosshair, Compass } from "lucide-react"
import { GEAR_LISTS } from "@/data/gear"
import { useSynced } from "@/lib/use-synced"
import { gearStore } from "@/lib/sync-stores"
import { cn } from "@/utils"

const ICONS = { fishing: Fish, hunting: Crosshair, outdoors: Compass }

export function GearChecklist() {
  const [listId, setListId] = useState(GEAR_LISTS[0].id)
  const [checked, setChecked] = useSynced(gearStore)
  const list = GEAR_LISTS.find((l) => l.id === listId)!
  const all = list.sections.flatMap((s) => s.items.map((i) => `${list.id}:${s.title}:${i}`))
  const done = all.filter((k) => checked[k]).length

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none lg:flex-col lg:overflow-visible">
        {GEAR_LISTS.map((l) => {
          const Icon = ICONS[l.activity]
          const keys = l.sections.flatMap((s) => s.items.map((i) => `${l.id}:${s.title}:${i}`))
          const n = keys.filter((k) => checked[k]).length
          return (
            <button key={l.id} onClick={() => setListId(l.id)} className={cn("flex shrink-0 items-center gap-3 rounded-xl border p-3 text-left transition lg:w-full", listId === l.id ? "border-emerald-700 bg-emerald-50" : "border-stone-200 bg-white hover:border-stone-300")}>
              <Icon className="h-5 w-5 text-emerald-800" />
              <span className="flex-1">
                <span className="block text-sm font-semibold">{l.name}</span>
                <span className="block text-xs text-stone-500">{n}/{keys.length} packed</span>
              </span>
            </button>
          )
        })}
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm md:p-7">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-3xl font-bold">{list.name}</h2>
            <p className="text-sm text-stone-600">{list.description}</p>
          </div>
          <button onClick={() => setChecked((c) => Object.fromEntries(Object.entries(c).filter(([k]) => !k.startsWith(list.id + ":"))))} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-stone-600 hover:bg-stone-100">
            <RotateCcw className="h-4 w-4" />Reset
          </button>
        </div>
        <div className="mb-6">
          <div className="flex justify-between text-xs font-semibold text-stone-600"><span>{done} of {all.length} packed</span><span>{Math.round((done / all.length) * 100)}%</span></div>
          <div className="mt-1.5 h-2 rounded-full bg-stone-100"><div className="h-full rounded-full bg-emerald-700 transition-all" style={{ width: `${(done / all.length) * 100}%` }} /></div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {list.sections.map((s) => (
            <div key={s.title}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-orange-700">{s.title}</p>
              <ul className="space-y-1">
                {s.items.map((item) => {
                  const k = `${list.id}:${s.title}:${item}`
                  const on = !!checked[k]
                  return (
                    <li key={item}>
                      <button onClick={() => setChecked((c) => ({ ...c, [k]: !on }))} className="flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-stone-50">
                        <span className={cn("grid h-5 w-5 shrink-0 place-items-center rounded border transition", on ? "border-emerald-700 bg-emerald-700 text-white" : "border-stone-300")}>{on && <Check className="h-3.5 w-3.5" />}</span>
                        <span className={cn(on && "text-stone-400 line-through")}>{item}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
        {done === all.length && <p className="mt-6 rounded-xl bg-emerald-50 p-3 text-center text-sm font-semibold text-emerald-900">All packed. Have a great trip! 🎣</p>}
      </div>
    </div>
  )
}
