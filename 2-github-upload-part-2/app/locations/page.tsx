import type { Metadata } from "next"
import { PageHero } from "@/components/bits"
import { LocationTile } from "@/components/tiles"
import { LOCATIONS, REGIONS } from "@/data/locations"

export const metadata: Metadata = { title: "Spots", description: "Texas bays, lakes, rivers and ranch country: access, species, hazards and local tips." }

export default function LocationsPage() {
  const regions = REGIONS.filter((r) => LOCATIONS.some((l) => l.region === r.id))
  return (
    <>
      <PageHero compact scene="hills" eyebrow={`${LOCATIONS.length} spots across Texas`} title="Spots worth the drive" subtitle="Where to go, how to get on the water or into the field, what you'll find, and what to watch out for." />
      <div className="mx-auto max-w-7xl space-y-14 px-4 py-12">
        {regions.map((r) => (
          <section key={r.id}>
            <div className="mb-5">
              <h2 className="text-3xl font-bold">{r.name}</h2>
              <p className="text-sm text-stone-600">{r.blurb}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {LOCATIONS.filter((l) => l.region === r.id).map((l, i) => <LocationTile key={l.slug} l={l} index={i} />)}
            </div>
          </section>
        ))}
      </div>
    </>
  )
}
