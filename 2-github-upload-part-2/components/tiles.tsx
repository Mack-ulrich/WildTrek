import Link from "next/link"
import { MapPin, Clock, Fish, Crosshair, Compass } from "lucide-react"
import type { Guide, Location, Species } from "@/lib/types"
import { Scene, sceneForLocationType, sceneForRegion, sceneForSpecies } from "@/components/scene"
import { Monogram, Stars, VerifiedBadge, Chip, MonthStrip } from "@/components/bits"
import { fromPrice } from "@/data/guides"
import { SPECIES_BY_SLUG, KIND_LABELS } from "@/data/species"
import { REGION_NAME } from "@/data/locations"

const ACT_ICON = { fishing: Fish, hunting: Crosshair, outdoors: Compass }
const ACT_LABEL = { fishing: "Fishing", hunting: "Hunting", outdoors: "Outdoors" }

export function GuideTile({ guide, index = 0 }: { guide: Guide; index?: number }) {
  const Icon = ACT_ICON[guide.activity]
  return (
    <Link href={`/guides/${guide.id}`} className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative h-32">
        <Scene kind={sceneForRegion(guide.region)} seed={index + 3} />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-xs font-semibold text-stone-800">
          <Icon className="h-3.5 w-3.5" /> {ACT_LABEL[guide.activity]}
        </span>
        <div className="absolute -bottom-6 left-4"><Monogram name={guide.name} tint={guide.tint} /></div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4 pt-8">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-xl font-bold leading-tight text-stone-900 group-hover:text-emerald-800">{guide.business}</h3>
            <p className="text-sm text-stone-600">{guide.name}</p>
          </div>
          {guide.verified && <VerifiedBadge />}
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-stone-600">
          <Stars rating={guide.rating} count={guide.reviewCount} />
          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{guide.homeBase}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {guide.disciplines.slice(0, 3).map((d) => <Chip key={d}>{d}</Chip>)}
        </div>
        <div className="mt-auto flex items-end justify-between border-t border-stone-100 pt-3">
          <span className="text-xs text-stone-500"><Clock className="mr-1 inline h-3 w-3" />{guide.yearsExperience} yrs guiding</span>
          <span className="text-sm text-stone-600">from <span className="font-display text-xl font-bold text-stone-900">${fromPrice(guide).toLocaleString()}</span></span>
        </div>
      </div>
    </Link>
  )
}

export function SpeciesTile({ s, index = 0 }: { s: Species; index?: number }) {
  return (
    <Link href={`/species/${s.slug}`} className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative h-24">
        <Scene kind={sceneForSpecies(s.kind)} seed={index} />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-xs font-semibold text-stone-800">{KIND_LABELS[s.kind]}</span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div>
          <h3 className="text-xl font-bold leading-tight text-stone-900 group-hover:text-emerald-800">{s.name}</h3>
          <p className="text-xs italic text-stone-500">{s.scientific}</p>
        </div>
        <p className="line-clamp-2 text-sm text-stone-600">{s.summary}</p>
        <div className="mt-auto pt-2">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-stone-500">Best months</p>
          <MonthStrip months={s.months} size="sm" />
        </div>
      </div>
    </Link>
  )
}

export function LocationTile({ l, index = 0 }: { l: Location; index?: number }) {
  return (
    <Link href={`/locations/${l.slug}`} className="group relative block h-56 overflow-hidden rounded-2xl shadow-sm">
      <Scene kind={sceneForLocationType(l.type)} seed={index + 5} className="transition-transform duration-500 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/25 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4 text-white">
        <p className="text-xs font-semibold uppercase tracking-wider text-amber-300">{REGION_NAME[l.region]}</p>
        <h3 className="text-2xl font-bold leading-tight">{l.name}</h3>
        <p className="mt-1 line-clamp-1 text-xs text-stone-200">
          {l.species.slice(0, 4).map((sl) => SPECIES_BY_SLUG[sl]?.name).filter(Boolean).join(" · ")}
        </p>
      </div>
    </Link>
  )
}
