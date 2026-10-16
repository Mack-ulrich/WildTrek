import { Suspense } from "react"
import type { Metadata } from "next"
import { PageHero } from "@/components/bits"
import { GuidesDirectory } from "@/components/guides-directory"
import { GUIDES } from "@/data/guides"

export const metadata: Metadata = { title: "Find a Guide", description: "Verified Texas fishing guides, hunting outfitters and outdoor trek leaders." }

export default function GuidesPage() {
  return (
    <>
      <PageHero
        compact
        scene="coast"
        eyebrow={`${GUIDES.length} verified guides`}
        title="Find your guide"
        subtitle="Inshore captains, offshore crews, bass pros, deer outfitters, waterfowl guides and desert trek leaders. Every license checked."
      />
      <div className="mx-auto max-w-7xl px-4 py-10">
        <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-stone-100" />}>
          <GuidesDirectory />
        </Suspense>
      </div>
    </>
  )
}
