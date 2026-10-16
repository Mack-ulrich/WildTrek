import Link from "next/link"
import type { Metadata } from "next"
import { Waves, Ship, Trees, Feather } from "lucide-react"
import { PageHero, SectionHeading, RegNotice } from "@/components/bits"
import { GuideTile, SpeciesTile, LocationTile } from "@/components/tiles"
import { GUIDES } from "@/data/guides"
import { SPECIES } from "@/data/species"
import { LOCATIONS } from "@/data/locations"
import { ARTICLES } from "@/data/articles"

export const metadata: Metadata = { title: "Fishing", description: "Texas inshore, offshore and freshwater fishing: species, spots, guides and live conditions." }

const STYLES = [
  { icon: Waves, title: "Inshore & flats", text: "Redfish, trout and flounder on grass flats, reefs and marsh drains. Wade, drift or sight-cast.", href: "/guides?activity=fishing&q=Inshore" },
  { icon: Ship, title: "Offshore", text: "Red snapper, kingfish, mahi and tarpon from nearshore rigs to blue water.", href: "/guides?activity=fishing&q=Offshore" },
  { icon: Trees, title: "Freshwater", text: "Trophy largemouth, Texoma stripers, giant blue cats and spring white bass runs.", href: "/guides?activity=fishing&q=Freshwater" },
  { icon: Feather, title: "Fly & kayak", text: "Quiet, technical and addictive. Tailing reds on the fly or a paddle into the back lakes.", href: "/guides?activity=fishing&q=Fly" },
]

export default function FishingPage() {
  const month = new Date().getMonth()
  const fish = SPECIES.filter((s) => s.activity === "fishing").sort((a, b) => b.months[month] - a.months[month])
  const guides = GUIDES.filter((g) => g.activity === "fishing").sort((a, b) => b.rating - a.rating).slice(0, 6)
  const spots = LOCATIONS.filter((l) => l.activity === "fishing").slice(0, 6)
  const reads = ARTICLES.filter((a) => a.activity !== "hunting").slice(0, 3)

  return (
    <>
      <PageHero eyebrow="Fish Texas" title="Bays, blue water & bass lakes" subtitle="367 miles of Gulf coastline and more than 100 major reservoirs. Here's how to fish all of it." scene="coast">
        <div className="flex flex-wrap gap-3">
          <Link href="/conditions" className="rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white hover:bg-orange-700">Check today&apos;s tides</Link>
          <Link href="/guides?activity=fishing" className="rounded-xl bg-white/10 px-5 py-3 font-semibold ring-1 ring-white/30 hover:bg-white/20">Book a fishing guide</Link>
        </div>
      </PageHero>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STYLES.map(({ icon: Icon, title, text, href }) => (
            <Link key={title} href={href} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <Icon className="h-7 w-7 text-sky-700" />
              <h3 className="mt-3 text-2xl font-bold">{title}</h3>
              <p className="mt-1 text-sm text-stone-600">{text}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14">
        <SectionHeading eyebrow="Sorted by what's hot this month" title="Species" href="/species?activity=fishing" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{fish.slice(0, 8).map((s, i) => <SpeciesTile key={s.slug} s={s} index={i} />)}</div>
        <RegNotice className="mt-6" />
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto max-w-7xl px-4">
          <SectionHeading title="Fishing guides" href="/guides?activity=fishing" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{guides.map((g, i) => <GuideTile key={g.id} guide={g} index={i} />)}</div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <SectionHeading title="Where to fish" href="/locations" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{spots.map((l, i) => <LocationTile key={l.slug} l={l} index={i} />)}</div>
      </section>

      <section className="mx-auto max-w-7xl px-4">
        <SectionHeading title="Learn from the guides" href="/cave" />
        <div className="grid gap-5 md:grid-cols-3">
          {reads.map((a) => (
            <Link key={a.slug} href={`/cave/${a.slug}`} className="rounded-2xl border border-stone-200 bg-white p-6 hover:shadow-md">
              <p className="text-xs font-semibold uppercase tracking-wider text-orange-700">{a.category}</p>
              <h3 className="mt-2 text-xl font-bold leading-tight">{a.title}</h3>
              <p className="mt-2 text-sm text-stone-600">{a.excerpt}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
