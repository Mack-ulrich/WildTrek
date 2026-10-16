import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { Navigation, AlertTriangle, Lightbulb, CalendarDays, ExternalLink, ChevronLeft } from "lucide-react"
import { LOCATIONS, LOCATION_BY_SLUG, REGION_NAME } from "@/data/locations"
import { SPECIES_BY_SLUG } from "@/data/species"
import { GUIDES } from "@/data/guides"
import { PageHero, MonthStrip } from "@/components/bits"
import { sceneForLocationType } from "@/components/scene"
import { GuideTile } from "@/components/tiles"
import { ConditionsBoard } from "@/components/conditions-board"

export function generateStaticParams() {
  return LOCATIONS.map((l) => ({ slug: l.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const l = LOCATION_BY_SLUG[(await params).slug]
  return l ? { title: l.name, description: l.summary } : {}
}

export default async function LocationDetail({ params }: { params: Promise<{ slug: string }> }) {
  const l = LOCATION_BY_SLUG[(await params).slug]
  if (!l) notFound()
  const guides = GUIDES.filter((g) => g.locationSlug === l.slug || (g.region === l.region && g.activity === l.activity)).slice(0, 3)
  const maps = `https://www.google.com/maps/search/?api=1&query=${l.lat},${l.lon}`

  return (
    <>
      <PageHero compact scene={sceneForLocationType(l.type)} eyebrow={`${REGION_NAME[l.region]} · ${l.type.replace("-", " ")}`} title={l.name} subtitle={l.summary}>
        <div className="flex flex-wrap gap-3">
          <a href={maps} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-stone-900 hover:bg-stone-100"><Navigation className="h-4 w-4" />Open in Maps</a>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm ring-1 ring-white/25"><CalendarDays className="h-4 w-4" />{l.bestMonths}</span>
        </div>
      </PageHero>

      <div className="mx-auto max-w-7xl space-y-12 px-4 py-10">
        <Link href="/locations" className="inline-flex items-center gap-1 text-sm font-medium text-stone-600 hover:text-stone-900"><ChevronLeft className="h-4 w-4" />All spots</Link>

        <section>
          <h2 className="mb-4 text-3xl font-bold">Live conditions</h2>
          <ConditionsBoard defaultLoc={l.slug} compact />
        </section>

        <section>
          <h2 className="mb-4 text-3xl font-bold">What&apos;s here</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {l.species.map((sl) => {
              const s = SPECIES_BY_SLUG[sl]
              if (!s) return null
              return (
                <Link key={sl} href={`/species/${sl}`} className="rounded-xl border border-stone-200 bg-white p-4 transition hover:border-emerald-700">
                  <p className="font-semibold">{s.name}</p>
                  <p className="mb-2 text-xs text-stone-500">{s.aka[0]}</p>
                  <MonthStrip months={s.months} size="sm" />
                </Link>
              )
            })}
          </div>
        </section>

        <div className="grid gap-6 md:grid-cols-3">
          <ListCard icon={Navigation} title="Access" items={l.access} tone="stone" />
          <ListCard icon={Lightbulb} title="Local tips" items={l.tips} tone="emerald" />
          <ListCard icon={AlertTriangle} title="Watch out for" items={l.hazards} tone="amber" />
        </div>

        {l.tideStation && (
          <a href={`https://tidesandcurrents.noaa.gov/stationhome.html?id=${l.tideStation.id}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-800 hover:underline">
            NOAA station {l.tideStation.name} ({l.tideStation.id}) <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}

        {guides.length > 0 && (
          <section>
            <h2 className="mb-5 text-3xl font-bold">Guides near {l.name}</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{guides.map((g, i) => <GuideTile key={g.id} guide={g} index={i} />)}</div>
          </section>
        )}
      </div>
    </>
  )
}

const TONES = {
  stone: "border-stone-200 bg-white",
  emerald: "border-emerald-200 bg-emerald-50",
  amber: "border-amber-200 bg-amber-50",
}

function ListCard({ icon: Icon, title, items, tone }: { icon: React.ComponentType<{ className?: string }>; title: string; items: string[]; tone: keyof typeof TONES }) {
  return (
    <div className={`rounded-2xl border p-5 ${TONES[tone]}`}>
      <p className="mb-3 flex items-center gap-2 font-display text-xl font-bold"><Icon className="h-5 w-5" />{title}</p>
      <ul className="space-y-2 text-sm text-stone-700">{items.map((i) => <li key={i}>• {i}</li>)}</ul>
    </div>
  )
}
