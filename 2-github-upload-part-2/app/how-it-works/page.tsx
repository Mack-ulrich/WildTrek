import Link from "next/link"
import type { Metadata } from "next"
import { Search, CalendarCheck, Fish, Star, ShieldCheck, FileCheck2, BadgeDollarSign, Users } from "lucide-react"
import { PageHero } from "@/components/bits"

export const metadata: Metadata = { title: "How It Works", description: "How booking, guide verification and payments work on WildTrek." }

const STEPS = [
  { icon: Search, title: "Find your guide", text: "Filter by activity, region, species and price. Read verified reviews and check credentials." },
  { icon: CalendarCheck, title: "Request a date", text: "Pick a trip and an open date. No charge until the guide confirms, usually within a few hours." },
  { icon: Fish, title: "Get out there", text: "Check live conditions the night before, pack with a gear list, and bring your license." },
  { icon: Star, title: "Log it & review", text: "Add your catch or harvest to your logbook and leave a review to help the next angler or hunter." },
]

const GUIDE_STEPS = [
  { icon: FileCheck2, title: "Apply & verify", text: "Upload your TPWD guide license or outfitter credentials, USCG license if you carry passengers, and proof of insurance. We review every document." },
  { icon: Users, title: "Build your profile", text: "Add trips, pricing, your boat or ranch, species you target and your home water." },
  { icon: BadgeDollarSign, title: "Get booked", text: "Accept requests, manage your calendar and get paid. No monthly fees; WildTrek charges customers a small service fee." },
]

const FAQ = [
  ["Do I need my own fishing or hunting license?", "Yes. Every angler 17 and older needs a Texas fishing license (with a saltwater endorsement on the coast), and hunters need the right license and endorsements. Guides can't sell them to you, but you can buy one online from TPWD in minutes."],
  ["What does the Verified badge mean?", "We've reviewed the guide's state license, any required Coast Guard license, and proof of insurance. Verification is re-checked every year."],
  ["What if the weather is bad?", "Safety comes first. Guides reschedule or refund for dangerous weather. Check each guide's policy before you book."],
  ["How much should I tip?", "15–20% of the trip price is customary for great service, paid directly to the guide or crew."],
]

export default function HowItWorksPage() {
  return (
    <>
      <PageHero compact scene="coast" eyebrow="Simple & safe" title="How WildTrek works" subtitle="Book with confidence: verified guides, transparent pricing and tools for every step of the trip." />
      <div className="mx-auto max-w-7xl space-y-16 px-4 py-14">
        <section>
          <h2 className="mb-6 text-3xl font-bold">For anglers & hunters</h2>
          <ol className="grid gap-4 md:grid-cols-4">
            {STEPS.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="rounded-2xl border border-stone-200 bg-white p-5">
                <span className="text-xs font-bold text-orange-700">STEP {i + 1}</span>
                <Icon className="mt-2 h-7 w-7 text-emerald-800" />
                <h3 className="mt-2 text-xl font-bold">{title}</h3>
                <p className="mt-1 text-sm text-stone-600">{text}</p>
              </li>
            ))}
          </ol>
          <Link href="/guides" className="mt-6 inline-block rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white hover:bg-orange-700">Browse guides</Link>
        </section>

        <section id="guides" className="scroll-mt-24 rounded-3xl bg-emerald-950 p-8 text-white md:p-12">
          <div className="flex items-center gap-3"><ShieldCheck className="h-8 w-8 text-amber-300" /><h2 className="text-3xl font-bold md:text-4xl">For guides & outfitters</h2></div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {GUIDE_STEPS.map(({ icon: Icon, title, text }) => (
              <div key={title}>
                <Icon className="h-7 w-7 text-amber-300" />
                <h3 className="mt-2 text-2xl font-bold">{title}</h3>
                <p className="mt-1 text-sm text-emerald-100/80">{text}</p>
              </div>
            ))}
          </div>
          <Link href="/auth/register?role=guide" className="mt-8 inline-block rounded-xl bg-white px-5 py-3 font-semibold text-emerald-950 hover:bg-emerald-50">Apply as a guide</Link>
        </section>

        <section className="mx-auto max-w-3xl">
          <h2 className="mb-6 text-3xl font-bold">FAQ</h2>
          <div className="space-y-3">
            {FAQ.map(([q, a]) => (
              <details key={q} className="group rounded-2xl border border-stone-200 bg-white p-5 open:shadow-sm">
                <summary className="cursor-pointer list-none font-semibold text-stone-900 marker:hidden">
                  <span className="flex items-center justify-between">{q}<span className="text-xl text-stone-400 transition group-open:rotate-45">+</span></span>
                </summary>
                <p className="mt-3 text-sm text-stone-600">{a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}
