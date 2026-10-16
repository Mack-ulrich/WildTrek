import type { Metadata } from "next"
import { PageHero } from "@/components/bits"
import { GearChecklist } from "@/components/gear-checklist"

export const metadata: Metadata = { title: "Gear Lists", description: "Tap-to-pack checklists for Texas fishing, hunting and backcountry trips." }

export default function GearPage() {
  return (
    <>
      <PageHero compact scene="pines" eyebrow="Never forget the tags again" title="Gear lists" subtitle="Tap to pack. Your progress is saved, so you can start packing the night before and finish at the ramp." />
      <div className="mx-auto max-w-7xl px-4 py-10"><GearChecklist /></div>
    </>
  )
}
