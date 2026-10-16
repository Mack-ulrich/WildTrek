import Link from "next/link"
import type { Metadata } from "next"
import { ExternalLink } from "lucide-react"
import { PageHero, RegNotice } from "@/components/bits"
import { SeasonBoard } from "@/components/season-board"
import { SPECIES } from "@/data/species"
import { SEASON_SOURCE } from "@/data/seasons"

export const metadata: Metadata = { title: "Seasons & Regulations", description: "Every 2026–27 Texas hunting season on one timeline, plus saltwater and freshwater bag and length limits." }

export default function RegulationsPage() {
  const fish = SPECIES.filter((s) => s.activity === "fishing" && s.regulation)
  return (
    <>
      <PageHero compact scene="marsh" eyebrow="2026–27 license year" title="Seasons & regs" subtitle="Hunting season dates and fishing limits at a glance, with links to the official TPWD rules for every line." />
      <div className="mx-auto max-w-7xl space-y-14 px-4 py-10">
        <RegNotice />

        <section>
          <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
            <h2 className="text-3xl font-bold">Hunting season calendar</h2>
            <a href={SEASON_SOURCE} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-800 hover:underline">TPWD season dates <ExternalLink className="h-3.5 w-3.5" /></a>
          </div>
          <SeasonBoard />
          <p className="mt-3 text-xs text-stone-500">Feral hogs: no closed season and no bag limit on private land with landowner permission (hunting license required). County-specific bag limits, antler restrictions and special seasons apply. Check your county in the Outdoor Annual.</p>
        </section>

        <section>
          <h2 className="mb-5 text-3xl font-bold">Fishing limits</h2>
          <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 text-left text-xs uppercase tracking-wider text-stone-500">
                <tr><th className="px-4 py-3">Species</th><th className="px-4 py-3">Water</th><th className="px-4 py-3">Limits (summary)</th><th className="px-4 py-3" /></tr>
              </thead>
              <tbody>
                {fish.map((s) => (
                  <tr key={s.slug} className="border-t border-stone-100 align-top">
                    <td className="px-4 py-3"><Link href={`/species/${s.slug}`} className="font-semibold text-stone-900 hover:text-emerald-800">{s.name}</Link></td>
                    <td className="px-4 py-3 capitalize text-stone-600">{s.kind}</td>
                    <td className="px-4 py-3 text-stone-700">{s.regulation!.summary}</td>
                    <td className="px-4 py-3 text-right"><a href={s.regulation!.source} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:underline">TPWD <ExternalLink className="h-3 w-3" /></a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-stone-500">Saltwater anglers need a fishing license with a saltwater endorsement. Possession limits are generally twice the daily bag unless noted.</p>
        </section>
      </div>
    </>
  )
}
