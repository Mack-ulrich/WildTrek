import Link from "next/link"
import { Fish, Crosshair, CloudSun, BookOpen, NotebookPen, Backpack, ShieldCheck, Search, ArrowRight, CalendarRange, Compass } from "lucide-react"
import { PageHero, SectionHeading } from "@/components/bits"
import { GuideTile, SpeciesTile, LocationTile } from "@/components/tiles"
import { ConditionsBoard } from "@/components/conditions-board"
import { SeasonBoard } from "@/components/season-board"
import { GUIDES } from "@/data/guides"
import { SPECIES } from "@/data/species"
import { LOCATIONS } from "@/data/locations"
import { ARTICLES } from "@/data/articles"

const TOOLS = [
  { href: "/conditions", icon: CloudSun, title: "Live Conditions", text: "Tides, wind, pressure, water temp and a bite score for every spot." },
  { href: "/species", icon: BookOpen, title: "Field Guide", text: `${SPECIES.length} fish and game species: how to ID them, find them and catch or hunt them.` },
  { href: "/regulations", icon: CalendarRange, title: "Seasons & Regs", text: "Every 2026–27 Texas season on one timeline, plus bag and size limits." },
  { href: "/logbook", icon: NotebookPen, title: "Logbook", text: "Log catches and harvests. Track personal bests and your best moon phase." },
  { href: "/gear", icon: Backpack, title: "Gear Lists", text: "Tap-to-pack checklists for wade fishing, offshore, deer blinds and more." },
  { href: "/locations", icon: Compass, title: "Spots", text: "Bays, lakes, rivers and ranch country with access, hazards and local tips." },
]

export default function HomePage() {
  const month = new Date().getMonth()
  const inSeason = SPECIES.filter((s) => s.months[month] >= 3).slice(0, 4)
  const featured = [...GUIDES].sort((a, b) => b.rating * b.reviewCount - a.rating * a.reviewCount).slice(0, 6)

  return (
    <>
      <PageHero
        eyebrow="Texas fishing · hunting · outdoors"
        title={<>Know where they&apos;re biting. <span className="text-amber-300">Book who knows.</span></>}
        subtitle="Verified fishing guides and hunting outfitters, live tides and solunar times, a complete field guide and the 2026–27 seasons, all in one place."
        scene="coast"
      >
        <form action="/guides" className="flex max-w-2xl flex-col gap-2 rounded-2xl bg-white p-2 shadow-2xl sm:flex-row">
          <label className="flex flex-1 items-center gap-2 px-3">
            <Search className="h-5 w-5 text-stone-400" />
            <input name="q" placeholder="Redfish in Port Aransas, whitetail, duck hunt…" className="w-full bg-transparent py-3 text-stone-900 outline-none placeholder:text-stone-400" />
          </label>
          <button className="rounded-xl bg-orange-600 px-6 py-3 font-semibold text-white hover:bg-orange-700">Find a guide</button>
        </form>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/fishing" className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold ring-1 ring-white/30 backdrop-blur hover:bg-white/20"><Fish className="h-4 w-4" />I&apos;m fishing</Link>
          <Link href="/hunting" className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold ring-1 ring-white/30 backdrop-blur hover:bg-white/20"><Crosshair className="h-4 w-4" />I&apos;m hunting</Link>
          <span className="flex items-center gap-2 px-2 py-2 text-sm text-stone-200"><ShieldCheck className="h-4 w-4 text-emerald-300" />Every guide license-checked</span>
        </div>
      </PageHero>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <SectionHeading eyebrow="Right now" title="Today on the water" subtitle="Live weather, tides and the WildTrek bite score. Pick any spot." href="/conditions" linkLabel="Full conditions" />
        <ConditionsBoard compact />
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto max-w-7xl px-4">
          <SectionHeading eyebrow="2026–27 Texas seasons" title="What's open" href="/regulations" linkLabel="Full season calendar" />
          <SeasonBoard compact />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <SectionHeading eyebrow="Top rated" title="Guides & outfitters" subtitle="Captains, outfitters and trek leaders with verified licenses and real reviews." href="/guides" linkLabel="Browse all guides" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((g, i) => <GuideTile key={g.id} guide={g} index={i} />)}
        </div>
      </section>

      <section className="bg-emerald-950 py-14 text-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-8">
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">Your toolkit</p>
            <h2 className="text-3xl font-bold md:text-4xl">Everything you need before, during and after the trip</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map(({ href, icon: Icon, title, text }) => (
              <Link key={href} href={href} className="group rounded-2xl bg-white/5 p-5 ring-1 ring-white/10 transition hover:bg-white/10">
                <Icon className="h-7 w-7 text-amber-300" />
                <h3 className="mt-3 text-2xl font-bold">{title}</h3>
                <p className="mt-1 text-sm text-emerald-100/80">{text}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-amber-300">Open <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {inSeason.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-14">
          <SectionHeading eyebrow="Peak this month" title="Prime targets" href="/species" linkLabel="Full field guide" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {inSeason.map((s, i) => <SpeciesTile key={s.slug} s={s} index={i} />)}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 pb-14">
        <SectionHeading eyebrow="Explore" title="Top spots" href="/locations" linkLabel="All spots" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {LOCATIONS.slice(0, 8).map((l, i) => <LocationTile key={l.slug} l={l} index={i} />)}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4">
        <SectionHeading eyebrow="From the guides" title="The Cave" href="/cave" linkLabel="All articles" />
        <div className="grid gap-5 md:grid-cols-3">
          {ARTICLES.slice(0, 3).map((a) => (
            <Link key={a.slug} href={`/cave/${a.slug}`} className="group rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition hover:shadow-lg">
              <p className="text-xs font-semibold uppercase tracking-wider text-orange-700">{a.category}</p>
              <h3 className="mt-2 text-2xl font-bold leading-tight group-hover:text-emerald-800">{a.title}</h3>
              <p className="mt-2 line-clamp-3 text-sm text-stone-600">{a.excerpt}</p>
              <p className="mt-4 text-xs text-stone-500">{a.author} · {a.readMinutes} min read</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-7xl px-4">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-orange-600 p-8 text-white md:flex-row md:items-center md:p-12">
          <div>
            <h2 className="text-3xl font-bold md:text-4xl">Are you a guide or outfitter?</h2>
            <p className="mt-2 max-w-xl text-orange-50">List your trips, manage bookings and get in front of thousands of Texas anglers and hunters. Free to join. We only earn when you get booked.</p>
          </div>
          <Link href="/how-it-works#guides" className="rounded-xl bg-white px-6 py-3 font-semibold text-orange-700 hover:bg-orange-50">How it works</Link>
        </div>
      </section>
    </>
  )
}
