import Link from "next/link"
import type { Metadata } from "next"
import { PageHero } from "@/components/bits"
import { Scene } from "@/components/scene"
import { ARTICLES } from "@/data/articles"

export const metadata: Metadata = { title: "The Cave", description: "How-tos, location spotlights and hunting prep written by Texas guides." }

const SCENE_BY_CAT = { "Tips & Tricks": "coast", "Gear Guide": "lake", "Location Spotlight": "marsh", "Species Guide": "river", "Hunting Prep": "brush", Safety: "offshore" } as const

export default function CavePage() {
  const [lead, ...rest] = [...ARTICLES].sort((a, b) => b.date.localeCompare(a.date))
  return (
    <>
      <PageHero compact scene="pines" eyebrow="Written by guides" title="The Cave" subtitle="Hard-won knowledge from the people who do this every day: tactics, prep, safety and the best spots in Texas." />
      <div className="mx-auto max-w-7xl px-4 py-10">
        <Link href={`/cave/${lead.slug}`} className="group mb-10 grid overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm md:grid-cols-2">
          <div className="h-56 md:h-auto"><Scene kind={SCENE_BY_CAT[lead.category]} seed={2} /></div>
          <div className="p-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-orange-700">Latest · {lead.category}</p>
            <h2 className="mt-2 text-4xl font-bold leading-tight group-hover:text-emerald-800">{lead.title}</h2>
            <p className="mt-3 text-stone-600">{lead.excerpt}</p>
            <p className="mt-6 text-sm text-stone-500">{lead.author} · {lead.authorRole} · {lead.readMinutes} min</p>
          </div>
        </Link>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((a, i) => (
            <Link key={a.slug} href={`/cave/${a.slug}`} className="group overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:shadow-lg">
              <div className="h-36"><Scene kind={SCENE_BY_CAT[a.category]} seed={i + 5} /></div>
              <div className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-orange-700">{a.category}</p>
                <h3 className="mt-1 text-2xl font-bold leading-tight group-hover:text-emerald-800">{a.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-stone-600">{a.excerpt}</p>
                <p className="mt-4 text-xs text-stone-500">{a.author} · {a.readMinutes} min read</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
