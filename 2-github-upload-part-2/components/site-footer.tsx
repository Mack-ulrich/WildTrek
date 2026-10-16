import Link from "next/link"
import { Logo } from "@/components/site-header"

const COLS = [
  { title: "Fish", links: [["Fishing hub", "/fishing"], ["Saltwater species", "/species?kind=saltwater"], ["Freshwater species", "/species?kind=freshwater"], ["Fishing guides", "/guides?activity=fishing"]] },
  { title: "Hunt", links: [["Hunting hub", "/hunting"], ["2026–27 seasons", "/regulations"], ["Game species", "/species?activity=hunting"], ["Outfitters", "/guides?activity=hunting"]] },
  { title: "Plan", links: [["Live conditions", "/conditions"], ["Spots", "/locations"], ["Gear lists", "/gear"], ["My logbook", "/logbook"]] },
  { title: "WildTrek", links: [["The Cave", "/cave"], ["Vibes", "/vibes"], ["How it works", "/how-it-works"], ["Become a guide", "/auth/register?role=guide"]] },
]

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-stone-800 bg-stone-950 text-stone-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-[1.3fr_repeat(4,1fr)]">
        <div className="space-y-4">
          <div className="[&_span]:!text-stone-100 [&_.text-orange-600]:!text-orange-500"><Logo /></div>
          <p className="max-w-xs text-sm text-stone-400">
            The field guide for Texas outdoorsmen. Book verified guides, read the water and woods, and keep a record of every day afield.
          </p>
        </div>
        {COLS.map((c) => (
          <div key={c.title}>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-stone-100">{c.title}</h4>
            <ul className="space-y-2 text-sm">
              {c.links.map(([label, href]) => (
                <li key={href}><Link href={href} className="text-stone-400 hover:text-white">{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-stone-800">
        <div className="mx-auto max-w-7xl space-y-2 px-4 py-6 text-xs text-stone-500">
          <p>
            Regulations and season dates are summarized from Texas Parks & Wildlife for convenience. Always confirm current rules in the{" "}
            <a className="underline hover:text-stone-300" href="https://tpwd.texas.gov/regulations/outdoor-annual/" target="_blank" rel="noreferrer">TPWD Outdoor Annual</a>{" "}
            before you go. Weather by Open-Meteo. Tide predictions by NOAA CO-OPS.
          </p>
          <p>© {new Date().getFullYear()} WildTrek 1.0</p>
        </div>
      </div>
    </footer>
  )
}
