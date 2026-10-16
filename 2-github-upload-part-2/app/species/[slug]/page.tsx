import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { Eye, Trees, Brain, Wrench, Lightbulb, Scale, Trophy, Ruler, ExternalLink, ChevronLeft } from "lucide-react"
import { SPECIES, SPECIES_BY_SLUG, KIND_LABELS } from "@/data/species"
import { GUIDES } from "@/data/guides"
import { LOCATIONS, REGION_NAME } from "@/data/locations"
import { PageHero, MonthStrip, MonthLegend, Chip, RegNotice } from "@/components/bits"
import { sceneForSpecies } from "@/components/scene"
import { GuideTile, LocationTile, SpeciesTile } from "@/components/tiles"

export function generateStaticParams() {
  return SPECIES.map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const s = SPECIES_BY_SLUG[(await params).slug]
  return s ? { title: `${s.name} — Field Guide`, description: s.summary } : {}
}

export default async function SpeciesDetail({ params }: { params: Promise<{ slug: string }> }) {
  const s = SPECIES_BY_SLUG[(await params).slug]
  if (!s) notFound()

  const guides = GUIDES.filter((g) => g.species.includes(s.slug)).slice(0, 3)
  const spots = LOCATIONS.filter((l) => l.species.includes(s.slug)).slice(0, 4)
  const related = s.related.map((r) => SPECIES_BY_SLUG[r]).filter(Boolean)
  const verb = s.activity === "fishing" ? "Catch" : "Hunt"

  return (
    <>
      <PageHero compact scene={sceneForSpecies(s.kind)} eyebrow={`${KIND_LABELS[s.kind]} · ${s.scientific}`} title={s.name} subtitle={s.summary}>
        <div className="flex flex-wrap gap-2">
          {s.aka.map((a) => <span key={a} className="rounded-full bg-white/15 px-3 py-1 text-sm ring-1 ring-white/25">&ldquo;{a}&rdquo;</span>)}
        </div>
      </PageHero>

      <div className="mx-auto max-w-7xl px-4 py-10">
        <Link href="/species" className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-stone-600 hover:text-stone-900"><ChevronLeft className="h-4 w-4" />Field guide</Link>

        <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
          <div className="space-y-10">
            <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-2xl font-bold">Best months in Texas</h2>
                <MonthLegend />
              </div>
              <MonthStrip months={s.months} />
            </section>

            <Block icon={Eye} title="How to identify">
              <ul className="grid gap-2 sm:grid-cols-2">
                {s.identify.map((i) => <li key={i} className="rounded-lg bg-stone-50 px-3 py-2 text-sm text-stone-700">{i}</li>)}
              </ul>
            </Block>

            <div className="grid gap-6 md:grid-cols-2">
              <Block icon={Trees} title="Where they live"><p className="text-stone-700">{s.habitat}</p></Block>
              <Block icon={Brain} title="Behavior"><p className="text-stone-700">{s.behavior}</p></Block>
            </div>

            <Block icon={Wrench} title={`How to ${verb.toLowerCase()} them`}>
              <div className="grid gap-3 md:grid-cols-2">
                {s.techniques.map((t, i) => (
                  <div key={t.name} className="rounded-xl border border-stone-200 bg-white p-4">
                    <p className="text-xs font-bold text-orange-700">0{i + 1}</p>
                    <p className="font-display text-xl font-bold">{t.name}</p>
                    <p className="mt-1 text-sm text-stone-600">{t.detail}</p>
                  </div>
                ))}
              </div>
              {s.baits.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-500">{s.activity === "fishing" ? "Top baits & lures" : "Calls, decoys & attractants"}</p>
                  <div className="flex flex-wrap gap-2">{s.baits.map((b) => <Chip key={b} className="bg-sky-50 text-sky-900">{b}</Chip>)}</div>
                </div>
              )}
              <p className="mt-4 rounded-xl bg-stone-900 p-4 text-sm text-stone-100"><span className="font-semibold text-amber-300">Gear: </span>{s.gear}</p>
            </Block>

            <Block icon={Lightbulb} title="Pro tips">
              <ul className="space-y-2">
                {s.proTips.map((t) => <li key={t} className="border-l-4 border-orange-500 bg-orange-50 px-4 py-2 text-stone-800">{t}</li>)}
              </ul>
            </Block>

            {spots.length > 0 && (
              <section>
                <h2 className="mb-4 text-2xl font-bold">Where to find {s.name.toLowerCase()}</h2>
                <div className="grid gap-4 sm:grid-cols-2">{spots.map((l, i) => <LocationTile key={l.slug} l={l} index={i} />)}</div>
              </section>
            )}
          </div>

          <aside className="space-y-5">
            {s.regulation && (
              <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-500"><Scale className="h-4 w-4" />{s.activity === "hunting" ? "Season & limits" : "Bag & size limits"}</p>
                <p className="text-stone-900">{s.regulation.summary}</p>
                <a href={s.regulation.source} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-emerald-800 hover:underline">Official TPWD rules <ExternalLink className="h-3.5 w-3.5" /></a>
                <RegNotice className="mt-4" />
              </div>
            )}
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-500"><Ruler className="h-4 w-4" />Typical size</p>
              <p className="text-stone-900">{s.avgSize}</p>
              {s.stateRecord && (
                <>
                  <p className="mb-1 mt-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-500"><Trophy className="h-4 w-4" />Texas record</p>
                  <p className="text-stone-900">{s.stateRecord}</p>
                </>
              )}
              <p className="mb-1 mt-4 text-xs font-semibold uppercase tracking-wider text-stone-500">Regions</p>
              <div className="flex flex-wrap gap-1.5">{s.regions.map((r) => <Chip key={r}>{REGION_NAME[r]}</Chip>)}</div>
            </div>
            <Link href={`/guides?species=${s.slug}`} className="block rounded-2xl bg-orange-600 p-5 text-white shadow-sm hover:bg-orange-700">
              <p className="font-display text-2xl font-bold">{verb} {s.name.toLowerCase()} with a pro</p>
              <p className="text-sm text-orange-50">{GUIDES.filter((g) => g.species.includes(s.slug)).length} verified guides target this species →</p>
            </Link>
            <Link href="/logbook" className="block rounded-2xl border border-stone-200 bg-white p-5 text-sm hover:border-emerald-700">
              <p className="font-semibold">Got one?</p>
              <p className="text-stone-600">Add it to your logbook and track your personal best.</p>
            </Link>
          </aside>
        </div>

        {guides.length > 0 && (
          <section className="mt-14">
            <h2 className="mb-5 text-3xl font-bold">Guides who target {s.name.toLowerCase()}</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{guides.map((g, i) => <GuideTile key={g.id} guide={g} index={i} />)}</div>
          </section>
        )}

        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="mb-5 text-3xl font-bold">Related species</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{related.map((r, i) => <SpeciesTile key={r.slug} s={r} index={i + 4} />)}</div>
          </section>
        )}
      </div>
    </>
  )
}

function Block({ icon: Icon, title, children }: { icon: React.ComponentType<{ className?: string }>; title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 text-2xl font-bold"><Icon className="h-5 w-5 text-emerald-800" />{title}</h2>
      {children}
    </section>
  )
}
