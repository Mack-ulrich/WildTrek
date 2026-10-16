import { Suspense } from "react"
import type { Metadata } from "next"
import { PageHero } from "@/components/bits"
import { SpeciesIndex } from "@/components/species-index"
import { SPECIES } from "@/data/species"

export const metadata: Metadata = { title: "Field Guide", description: "Identify, find and catch or hunt every major Texas fish and game species." }

export default function SpeciesPage() {
  return (
    <>
      <PageHero
        compact
        scene="river"
        eyebrow="The WildTrek Field Guide"
        title="Know your quarry"
        subtitle={`${SPECIES.length} Texas fish and game species with identification tips, habitat, best months, proven techniques and current limits.`}
      />
      <div className="mx-auto max-w-7xl px-4 py-10">
        <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-stone-100" />}>
          <SpeciesIndex />
        </Suspense>
      </div>
    </>
  )
}
