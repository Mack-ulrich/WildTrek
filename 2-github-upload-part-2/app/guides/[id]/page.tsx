import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { MapPin, Ship, Languages, BadgeCheck, Check, Star, ChevronLeft } from "lucide-react"
import { getGuide, getGuides } from "@/lib/guides-source"
import { SPECIES_BY_SLUG } from "@/data/species"
import { REGION_NAME, LOCATION_BY_SLUG } from "@/data/locations"
import { Scene, sceneForRegion } from "@/components/scene"
import { Monogram, Stars, VerifiedBadge, Chip, MonthStrip } from "@/components/bits"
import { BookingWidget } from "@/components/booking-widget"
import { GuideTile } from "@/components/tiles"

export async function generateStaticParams() {
  return (await getGuides()).map((g) => ({ id: g.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const g = await getGuide((await params).id)
  return g ? { title: `${g.business} — ${g.name}`, description: g.bio } : {}
}

export default async function GuidePage({ params }: { params: Promise<{ id: string }> }) {
  const g = await getGuide((await params).id)
  if (!g) notFound()

  const loc = g.locationSlug ? LOCATION_BY_SLUG[g.locationSlug] : undefined
  const similar = (await getGuides()).filter((x) => x.id !== g.id && (x.region === g.region || x.activity === g.activity)).slice(0, 3)
  const dist = [5, 4, 3, 2, 1].map((n) => ({ n, c: g.reviews.filter((r) => r.rating === n).length }))

  return (
    <>
      <div className="relative h-48 md:h-64">
        <Scene kind={sceneForRegion(g.region)} seed={4} />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/50 to-transparent" />
        <div className="absolute left-0 right-0 top-4 mx-auto max-w-7xl px-4">
          <Link href="/guides" className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-sm font-medium text-stone-800 hover:bg-white"><ChevronLeft className="h-4 w-4" />All guides</Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4">
        <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
          <div className="-mt-12 space-y-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <Monogram name={g.name} tint={g.tint} size="lg" />
              <div className="pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-4xl font-bold leading-none text-stone-900 md:text-5xl">{g.business}</h1>
                  {g.verified && <VerifiedBadge />}
                </div>
                <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-stone-600">
                  <span className="font-medium text-stone-800">{g.name}</span>
                  <Stars rating={g.rating} count={g.reviewCount} />
                  <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{g.homeBase} · {REGION_NAME[g.region]}</span>
                </p>
              </div>
            </div>

            <section>
              <p className="text-lg leading-relaxed text-stone-700">{g.bio}</p>
              <div className="mt-4 flex flex-wrap gap-2">{g.disciplines.map((d) => <Chip key={d} className="bg-emerald-50 text-emerald-900">{d}</Chip>)}</div>
              <ul className="mt-5 grid gap-2 sm:grid-cols-3">
                {g.highlights.map((h) => <li key={h} className="flex items-start gap-2 text-sm text-stone-700"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />{h}</li>)}
              </ul>
            </section>

            <section className="grid gap-4 sm:grid-cols-3">
              <Fact icon={BadgeCheck} label="Experience" value={`${g.yearsExperience} years guiding`} />
              {g.boat && <Fact icon={Ship} label="Boat" value={g.boat} />}
              <Fact icon={Languages} label="Languages" value={g.languages.join(", ")} />
            </section>

            <section>
              <h2 className="mb-4 text-3xl font-bold">Trips & pricing</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {g.packages.map((p) => (
                  <div key={p.id} className="rounded-2xl border border-stone-200 bg-white p-5">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="text-xl font-bold">{p.name}</h3>
                      <span className="font-display text-2xl font-bold">${p.price.toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-stone-500">{p.hours >= 24 ? `${Math.round(p.hours / 24)} days` : `${p.hours} hours`} · up to {p.maxGuests}</p>
                    <ul className="mt-3 space-y-1">{p.includes.map((i) => <li key={i} className="flex items-center gap-2 text-sm text-stone-700"><Check className="h-3.5 w-3.5 text-emerald-700" />{i}</li>)}</ul>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-3xl font-bold">What you&apos;ll target</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {g.species.map((sl) => {
                  const s = SPECIES_BY_SLUG[sl]
                  if (!s) return null
                  return (
                    <Link key={sl} href={`/species/${sl}`} className="rounded-xl border border-stone-200 bg-white p-4 hover:border-emerald-700">
                      <p className="font-semibold text-stone-900">{s.name}</p>
                      <p className="mb-2 text-xs text-stone-500">{s.aka.slice(0, 2).join(" · ")}</p>
                      <MonthStrip months={s.months} size="sm" />
                    </Link>
                  )
                })}
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-3xl font-bold">Licenses & credentials</h2>
              <ul className="space-y-2">
                {g.licenses.map((l) => (
                  <li key={l} className="flex items-center gap-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-950"><BadgeCheck className="h-5 w-5 text-emerald-700" />{l}</li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-stone-500">WildTrek reviews license documents before a guide can accept bookings.</p>
            </section>

            <section>
              <h2 className="mb-4 text-3xl font-bold">Reviews</h2>
              <div className="mb-6 flex flex-col gap-6 rounded-2xl border border-stone-200 bg-white p-5 sm:flex-row sm:items-center">
                <div className="text-center sm:pr-6">
                  <p className="font-display text-6xl font-bold">{g.rating.toFixed(1)}</p>
                  <p className="text-sm text-stone-500">{g.reviewCount} reviews</p>
                </div>
                <div className="flex-1 space-y-1">
                  {dist.map(({ n, c }) => (
                    <div key={n} className="flex items-center gap-2 text-xs">
                      <span className="w-3">{n}</span><Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <div className="h-2 flex-1 rounded-full bg-stone-100"><div className="h-full rounded-full bg-amber-400" style={{ width: `${g.reviews.length ? (c / g.reviews.length) * 100 : 0}%` }} /></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                {g.reviews.map((r) => (
                  <div key={r.author + r.date} className="rounded-2xl border border-stone-200 bg-white p-5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold">{r.author}</p>
                      <span className="flex">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`h-4 w-4 ${i < r.rating ? "fill-amber-400 text-amber-400" : "text-stone-200"}`} />)}</span>
                    </div>
                    <p className="text-xs text-stone-500">{new Date(r.date + "T12:00").toLocaleDateString("en-US", { month: "long", year: "numeric" })}{r.trip && ` · ${r.trip}`}</p>
                    <p className="mt-2 text-stone-700">{r.text}</p>
                  </div>
                ))}
              </div>
            </section>

            {loc && (
              <section className="rounded-2xl border border-stone-200 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-orange-700">Home water</p>
                <h3 className="text-2xl font-bold">{loc.name}</h3>
                <p className="mt-1 text-sm text-stone-600">{loc.summary}</p>
                <div className="mt-3 flex gap-4 text-sm font-semibold">
                  <Link href={`/locations/${loc.slug}`} className="text-emerald-800 hover:underline">Spot guide →</Link>
                  <Link href={`/conditions?loc=${loc.slug}`} className="text-emerald-800 hover:underline">Live conditions →</Link>
                </div>
              </section>
            )}
          </div>

          <aside className="lg:pt-8">
            <div className="lg:sticky lg:top-24"><BookingWidget guide={g} /></div>
          </aside>
        </div>

        {similar.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-5 text-3xl font-bold">You might also like</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{similar.map((s, i) => <GuideTile key={s.id} guide={s} index={i + 2} />)}</div>
          </section>
        )}
      </div>
    </>
  )
}

function Fact({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-stone-500"><Icon className="h-4 w-4" />{label}</p>
      <p className="mt-1 text-sm font-medium text-stone-900">{value}</p>
    </div>
  )
}
