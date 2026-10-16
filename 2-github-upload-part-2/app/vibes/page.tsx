import type { Metadata } from "next"
import { PageHero } from "@/components/bits"
import { VibesWall } from "@/components/vibes-wall"

export const metadata: Metadata = { title: "Vibes", description: "Catch reports, harvest stories and fishing reports from the WildTrek community." }

export default function VibesPage() {
  return (
    <>
      <PageHero compact scene="lake" eyebrow="Community" title="Vibes" subtitle="Fresh reports from guides, anglers and hunters: what's biting, where and on what." />
      <div className="mx-auto max-w-2xl px-4 py-10"><VibesWall /></div>
    </>
  )
}
