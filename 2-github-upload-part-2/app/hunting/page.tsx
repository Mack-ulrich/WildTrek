import Link from "next/link"
import type { Metadata } from "next"
import { GraduationCap, FileBadge, Tag, ClipboardCheck } from "lucide-react"
import { PageHero, SectionHeading, RegNotice } from "@/components/bits"
import { GuideTile, SpeciesTile, LocationTile } from "@/components/tiles"
import { SeasonBoard } from "@/components/season-board"
import { GUIDES } from "@/data/guides"
import { SPECIES } from "@/data/species"
import { LOCATIONS } from "@/data/locations"

export const metadata: Metadata = { title: "Hunting", description: "2026–27 Texas hunting seasons, game species, outfitters and prep for whitetail, waterfowl, turkey, dove and hogs." }

const PREP = [
  { icon: GraduationCap, title: "Hunter education", text: "Required if you were born on or after Sept. 2, 1971. Take it online through TPWD; a one-time deferral is available.", href: "https://tpwd.texas.gov/education/hunter-education" },
  { icon: FileBadge, title: "License & endorsements", text: "A hunting license, plus the Archery, Migratory Game Bird or Upland Game Bird endorsements as needed. Federal Duck Stamp for waterfowl.", href: "https://tpwd.texas.gov/regulations/outdoor-annual/licenses" },
  { icon: Tag, title: "Tag & report", text: "Tag deer and turkey immediately and fill out your harvest log. Report harvests in counties that require it.", href: "https://tpwd.texas.gov/regulations/outdoor-annual/hunting" },
  { icon: ClipboardCheck, title: "Pack it right", text: "Use the WildTrek gear lists for deer blinds, waterfowl marshes and night hog hunts.", href: "/gear" },
]

export default function HuntingPage() {
  const game = SPECIES.filter((s) => s.activity === "hunting")
  const outfitters = GUIDES.filter((g) => g.activity === "hunting")
  const country = LOCATIONS.filter((l) => l.activity === "hunting")

  return (
    <>
      <PageHero eyebrow="Hunt Texas · 2026–27" title="5.6 million whitetails and a whole lot more" subtitle="Brush-country bucks, Hill Country gobblers, prairie geese, Laguna redheads and year-round hogs. Seasons, game and outfitters in one place." scene="brush">
        <div className="flex flex-wrap gap-3">
          <Link href="/regulations" className="rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white hover:bg-orange-700">2026–27 season calendar</Link>
          <Link href="/guides?activity=hunting" className="rounded-xl bg-white/10 px-5 py-3 font-semibold ring-1 ring-white/30 hover:bg-white/20">Find an outfitter</Link>
        </div>
      </PageHero>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <SectionHeading eyebrow="Live" title="Seasons right now" href="/regulations" linkLabel="Full calendar & limits" />
        <SeasonBoard compact />
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto max-w-7xl px-4">
          <SectionHeading title="Game species" href="/species?activity=hunting" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{game.map((s, i) => <SpeciesTile key={s.slug} s={s} index={i} />)}</div>
          <RegNotice className="mt-6" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <SectionHeading eyebrow="Before you go" title="Legal & ready" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PREP.map(({ icon: Icon, title, text, href }) => {
            const external = href.startsWith("http")
            return (
              <a key={title} href={href} {...(external ? { target: "_blank", rel: "noreferrer" } : {})} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:shadow-md">
                <Icon className="h-7 w-7 text-orange-600" />
                <h3 className="mt-3 text-xl font-bold">{title}</h3>
                <p className="mt-1 text-sm text-stone-600">{text}</p>
              </a>
            )
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14">
        <SectionHeading title="Outfitters" href="/guides?activity=hunting" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{outfitters.map((g, i) => <GuideTile key={g.id} guide={g} index={i} />)}</div>
      </section>

      <section className="mx-auto max-w-7xl px-4">
        <SectionHeading title="Hunting country" href="/locations" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{country.map((l, i) => <LocationTile key={l.slug} l={l} index={i} />)}</div>
      </section>
    </>
  )
}
