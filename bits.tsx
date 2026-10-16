import Link from "next/link"
import { Star, ShieldCheck, ArrowRight } from "lucide-react"
import { cn } from "@/utils"
import { Scene, type SceneKind } from "@/components/scene"
import { MONTHS_SHORT } from "@/data/species"
import type { MonthRating } from "@/lib/types"

export function PageHero({
  eyebrow, title, subtitle, scene = "coast", children, compact,
}: { eyebrow?: string; title: React.ReactNode; subtitle?: string; scene?: SceneKind; children?: React.ReactNode; compact?: boolean }) {
  return (
    <section className="relative overflow-hidden bg-stone-900 text-white">
      <div className="absolute inset-0"><Scene kind={scene} /></div>
      <div className="absolute inset-0 bg-gradient-to-r from-stone-950/85 via-stone-950/55 to-stone-950/10" />
      <div className={cn("relative mx-auto max-w-7xl px-4", compact ? "py-12 md:py-16" : "py-16 md:py-24")}>
        {eyebrow && <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">{eyebrow}</p>}
        <h1 className="max-w-3xl text-4xl font-bold leading-[1.05] md:text-6xl">{title}</h1>
        {subtitle && <p className="mt-4 max-w-2xl text-base text-stone-200 md:text-lg">{subtitle}</p>}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  )
}

export function SectionHeading({ eyebrow, title, href, linkLabel = "See all", subtitle }: { eyebrow?: string; title: string; href?: string; linkLabel?: string; subtitle?: string }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow && <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">{eyebrow}</p>}
        <h2 className="text-3xl font-bold text-stone-900 md:text-4xl">{title}</h2>
        {subtitle && <p className="mt-1 max-w-2xl text-sm text-stone-600">{subtitle}</p>}
      </div>
      {href && (
        <Link href={href} className="group flex items-center gap-1 text-sm font-semibold text-emerald-800 hover:text-emerald-950">
          {linkLabel} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  )
}

const TINTS = {
  pine: "bg-emerald-800 text-emerald-50",
  gulf: "bg-sky-800 text-sky-50",
  blaze: "bg-orange-600 text-orange-50",
  sand: "bg-amber-600 text-amber-50",
  dusk: "bg-indigo-800 text-indigo-50",
} as const

export function Monogram({ name, tint = "pine", size = "md" }: { name: string; tint?: keyof typeof TINTS; size?: "sm" | "md" | "lg" }) {
  const letters = name.replace(/^(Capt\.|Captain)\s+/i, "").split(/\s+/).map((w) => w[0]).slice(0, 2).join("")
  return (
    <span className={cn("grid shrink-0 place-items-center rounded-full font-display font-bold", TINTS[tint], size === "sm" ? "h-9 w-9 text-sm" : size === "lg" ? "h-20 w-20 text-3xl ring-4 ring-white" : "h-12 w-12 text-lg")}>
      {letters}
    </span>
  )
}

export function Stars({ rating, count, className }: { rating: number; count?: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 text-sm", className)}>
      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
      <span className="font-semibold text-stone-900">{rating.toFixed(1)}</span>
      {count !== undefined && <span className="text-stone-500">({count})</span>}
    </span>
  )
}

export function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
      <ShieldCheck className="h-3.5 w-3.5" /> Verified
    </span>
  )
}

export function Chip({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("inline-flex items-center rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-700", className)}>{children}</span>
}

const RATING_CLS = ["bg-stone-200", "bg-emerald-200", "bg-emerald-500", "bg-orange-500"]
const RATING_LABEL = ["Off / poor", "Fair", "Good", "Peak"]

/** 12-month strip showing best times for a species. */
export function MonthStrip({ months, size = "md", highlightCurrent = true }: { months: MonthRating; size?: "sm" | "md"; highlightCurrent?: boolean }) {
  const cur = new Date().getMonth()
  return (
    <div>
      <div className="grid grid-cols-12 gap-0.5">
        {months.map((r, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div
              title={`${MONTHS_SHORT[i]}: ${RATING_LABEL[r]}`}
              className={cn("w-full rounded-sm", RATING_CLS[r], size === "sm" ? "h-2" : "h-6", highlightCurrent && i === cur && "ring-2 ring-stone-900 ring-offset-1")}
            />
            {size === "md" && <span className={cn("text-[10px] text-stone-500", i === cur && "font-bold text-stone-900")}>{MONTHS_SHORT[i][0]}</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

export function MonthLegend() {
  return (
    <div className="flex flex-wrap gap-3 text-xs text-stone-600">
      {RATING_LABEL.map((l, i) => (
        <span key={l} className="flex items-center gap-1.5"><span className={cn("h-2.5 w-4 rounded-sm", RATING_CLS[i])} />{l}</span>
      ))}
    </div>
  )
}

export function RegNotice({ className }: { className?: string }) {
  return (
    <p className={cn("rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900", className)}>
      Regulations summarized from TPWD for 2026–27. Rules can change mid-season and vary by county or water body.{" "}
      <a className="font-semibold underline" href="https://tpwd.texas.gov/regulations/outdoor-annual/" target="_blank" rel="noreferrer">Confirm in the Outdoor Annual</a>.
    </p>
  )
}
