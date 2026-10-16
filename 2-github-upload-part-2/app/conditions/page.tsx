import type { Metadata } from "next"
import { PageHero } from "@/components/bits"
import { ConditionsBoard } from "@/components/conditions-board"
import { LOCATION_BY_SLUG } from "@/data/locations"

export const metadata: Metadata = { title: "Live Conditions", description: "Live Texas tides, wind, barometric pressure, water temperature, solunar tables and the WildTrek bite score." }

export default async function ConditionsPage({ searchParams }: { searchParams: Promise<{ loc?: string }> }) {
  const { loc } = await searchParams
  const start = loc && LOCATION_BY_SLUG[loc] ? loc : "port-aransas"
  return (
    <>
      <PageHero compact scene="offshore" eyebrow="Live · no guesswork" title="Conditions" subtitle="NOAA tide predictions, live weather and marine data, solunar periods and a bite score for every WildTrek spot." />
      <div className="mx-auto max-w-7xl px-4 py-10">
        <ConditionsBoard key={start} defaultLoc={start} />
        <div className="mt-10 grid gap-4 text-sm text-stone-600 md:grid-cols-3">
          <Explainer title="Falling pressure = feeding">Fish and game often feed hard ahead of a front as barometric pressure drops, then go quiet for a day or two after it passes.</Explainer>
          <Explainer title="Moving water moves bait">Fish the two hours around a tide change. On the Texas coast, wind can push or hold water more than the moon does.</Explainer>
          <Explainer title="Solunar windows">Major periods (moon overhead or underfoot) and minor periods (moonrise or moonset) line up with peaks in animal activity. Best when they overlap dawn or dusk.</Explainer>
        </div>
      </div>
    </>
  )
}

function Explainer({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5">
      <p className="mb-1 font-display text-xl font-bold text-stone-900">{title}</p>
      <p>{children}</p>
    </div>
  )
}
