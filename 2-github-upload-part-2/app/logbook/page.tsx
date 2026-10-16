import type { Metadata } from "next"
import { PageHero } from "@/components/bits"
import { Logbook } from "@/components/logbook"

export const metadata: Metadata = { title: "My Logbook", description: "Log every catch and harvest, track personal bests and find patterns." }

export default function LogbookPage() {
  return (
    <>
      <PageHero compact scene="lake" eyebrow="Your record afield" title="Logbook" subtitle="Every catch and harvest with spot, method and moon phase recorded automatically. Find your patterns and chase your personal bests." />
      <div className="mx-auto max-w-5xl px-4 py-10">
        <Logbook />
        <p className="mt-8 text-center text-xs text-stone-500">Entries are saved on this device. Export a CSV anytime. Cloud sync arrives with WildTrek accounts.</p>
      </div>
    </>
  )
}
