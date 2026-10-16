"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { CalendarDays, Users, Check, ShieldCheck, Clock } from "lucide-react"
import type { Guide } from "@/lib/types"
import { uid } from "@/lib/use-local"
import { useSynced } from "@/lib/use-synced"
import { bookingsStore } from "@/lib/sync-stores"
import { useAuth } from "@/auth-context"
import { supabaseConfigured } from "@/supabase"
import { useToast } from "@/use-toast"
import { cn } from "@/utils"

export interface Booking {
  id: string
  guideId: string
  guideName: string
  business: string
  packageName: string
  date: string
  guests: number
  total: number
  name: string
  email: string
  notes: string
  createdAt: string
  status: "requested" | "confirmed" | "completed" | "cancelled"
}

const SERVICE_FEE = 0.06

/** Deterministic "booked" days so the calendar feels real before guide calendars are connected. */
function isBooked(guideId: string, iso: string) {
  let h = 0
  for (const c of guideId + iso) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return h % 5 === 0
}

export function BookingWidget({ guide }: { guide: Guide }) {
  const { toast } = useToast()
  const { session, user } = useAuth()
  const [, setBookings] = useSynced(bookingsStore)
  const [pkgId, setPkgId] = useState(guide.packages[0].id)
  const [date, setDate] = useState<string | null>(null)
  const [guests, setGuests] = useState(1)
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [form, setForm] = useState({ name: "", email: "", notes: "" })
  const [confirmed, setConfirmed] = useState<Booking | null>(null)

  useEffect(() => {
    if (user) setForm((f) => ({ ...f, name: f.name || user.name, email: f.email || user.email }))
  }, [user])

  const pkg = guide.packages.find((p) => p.id === pkgId)!
  const fee = Math.round(pkg.price * SERVICE_FEE)
  const total = pkg.price + fee

  const days = useMemo(() => {
    const out: { iso: string; d: Date; booked: boolean }[] = []
    const start = new Date()
    start.setHours(12, 0, 0, 0)
    for (let i = 1; i <= 28; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      const iso = d.toLocaleDateString("en-CA")
      out.push({ iso, d, booked: isBooked(guide.id, iso) })
    }
    return out
  }, [guide.id])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!date) return
    const b: Booking = {
      id: uid(),
      guideId: guide.id,
      guideName: guide.name,
      business: guide.business,
      packageName: pkg.name,
      date,
      guests,
      total,
      name: form.name.trim(),
      email: form.email.trim(),
      notes: form.notes.trim(),
      createdAt: new Date().toISOString(),
      status: "requested",
    }
    setBookings((prev) => [b, ...prev])
    // Signed-in requests sync through useSynced; guests still reach the guide via the API.
    if (supabaseConfigured && !session) {
      fetch("/api/bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).catch(() => {})
    }
    setConfirmed(b)
    setStep(3)
    toast({ title: "Trip request sent", description: `${guide.business} will confirm ${new Date(date + "T12:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}.` })
  }

  if (step === 3 && confirmed) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-lg">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-emerald-800"><Check className="h-7 w-7" /></div>
        <h3 className="text-center text-2xl font-bold">Request sent!</h3>
        <p className="mt-1 text-center text-sm text-stone-600">{guide.business} typically confirms within a few hours. No charge until they confirm.</p>
        <dl className="mt-5 space-y-2 rounded-xl bg-stone-50 p-4 text-sm">
          <Row k="Trip" v={confirmed.packageName} />
          <Row k="Date" v={new Date(confirmed.date + "T12:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })} />
          <Row k="Guests" v={String(confirmed.guests)} />
          <Row k="Estimated total" v={`$${confirmed.total.toLocaleString()}`} />
        </dl>
        <div className="mt-5 grid gap-2">
          <Link href="/dashboard" className="rounded-lg bg-emerald-800 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-emerald-900">View my trips</Link>
          <Link href="/gear" className="rounded-lg border border-stone-300 px-4 py-2.5 text-center text-sm font-semibold text-stone-800 hover:bg-stone-50">Pack with a gear checklist</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-lg">
      <div className="mb-4 flex items-baseline justify-between">
        <p><span className="font-display text-3xl font-bold">${pkg.price.toLocaleString()}</span> <span className="text-sm text-stone-500">/ trip</span></p>
        <span className="flex items-center gap-1 text-xs text-stone-500"><Clock className="h-3.5 w-3.5" />{guide.responseTime.replace("Usually replies ", "")}</span>
      </div>

      {step === 1 && (
        <div className="space-y-5">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Choose a trip</p>
            {guide.packages.map((p) => (
              <button key={p.id} onClick={() => { setPkgId(p.id); setGuests((g) => Math.min(g, p.maxGuests)) }} className={cn("w-full rounded-xl border p-3 text-left transition", pkgId === p.id ? "border-emerald-700 bg-emerald-50 ring-1 ring-emerald-700" : "border-stone-200 hover:border-stone-300")}>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-semibold text-stone-900">{p.name}</span>
                  <span className="font-semibold">${p.price.toLocaleString()}</span>
                </div>
                <span className="text-xs text-stone-500">{p.hours >= 24 ? `${Math.round(p.hours / 24)} days` : `${p.hours} hrs`} · up to {p.maxGuests} {p.maxGuests === 1 ? "hunter" : "guests"}</span>
              </button>
            ))}
          </div>

          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-stone-500"><CalendarDays className="h-3.5 w-3.5" />Pick a date</p>
            <div className="grid grid-cols-7 gap-1">
              {days.map(({ iso, d, booked }) => (
                <button
                  key={iso}
                  disabled={booked}
                  onClick={() => setDate(iso)}
                  className={cn(
                    "flex flex-col items-center rounded-lg py-1.5 text-xs transition",
                    booked ? "cursor-not-allowed bg-stone-50 text-stone-300 line-through" : date === iso ? "bg-emerald-800 text-white" : "bg-stone-50 text-stone-800 hover:bg-emerald-100",
                  )}
                  title={booked ? "Booked" : d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                >
                  <span className="text-[9px] uppercase opacity-70">{d.toLocaleDateString("en-US", { weekday: "narrow" })}</span>
                  <span className="font-semibold">{d.getDate()}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-stone-500"><Users className="h-3.5 w-3.5" />Guests</p>
            <div className="flex items-center gap-3">
              <button onClick={() => setGuests((g) => Math.max(1, g - 1))} className="h-9 w-9 rounded-full border border-stone-300 text-lg font-semibold disabled:opacity-40" disabled={guests <= 1}>−</button>
              <span className="w-8 text-center font-display text-2xl font-bold">{guests}</span>
              <button onClick={() => setGuests((g) => Math.min(pkg.maxGuests, g + 1))} className="h-9 w-9 rounded-full border border-stone-300 text-lg font-semibold disabled:opacity-40" disabled={guests >= pkg.maxGuests}>+</button>
              <span className="text-xs text-stone-500">max {pkg.maxGuests}</span>
            </div>
          </div>

          <PriceLines price={pkg.price} fee={fee} total={total} />
          <button disabled={!date} onClick={() => setStep(2)} className="w-full rounded-xl bg-orange-600 py-3 font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-stone-300">
            {date ? "Continue" : "Select a date to continue"}
          </button>
        </div>
      )}

      {step === 2 && (
        <form onSubmit={submit} className="space-y-4">
          <div className="rounded-xl bg-stone-50 p-3 text-sm">
            <p className="font-semibold">{pkg.name}</p>
            <p className="text-stone-600">{date && new Date(date + "T12:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} · {guests} guest{guests > 1 ? "s" : ""}</p>
            <button type="button" onClick={() => setStep(1)} className="mt-1 text-xs font-semibold text-emerald-800 hover:underline">Change</button>
          </div>
          <Field label="Your name"><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm" /></Field>
          <Field label="Email"><input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm" /></Field>
          <Field label="Anything the guide should know? (optional)">
            <textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Experience level, kids in the group, target species…" className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm" />
          </Field>
          <PriceLines price={pkg.price} fee={fee} total={total} />
          <button type="submit" className="w-full rounded-xl bg-orange-600 py-3 font-semibold text-white hover:bg-orange-700">Send trip request</button>
          <p className="flex items-start gap-1.5 text-[11px] text-stone-500"><ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />You won't be charged until the guide confirms. You'll need your own Texas fishing or hunting license.</p>
        </form>
      )}
    </div>
  )
}

function PriceLines({ price, fee, total }: { price: number; fee: number; total: number }) {
  return (
    <div className="space-y-1.5 border-t border-stone-100 pt-3 text-sm">
      <div className="flex justify-between text-stone-600"><span>Trip price</span><span>${price.toLocaleString()}</span></div>
      <div className="flex justify-between text-stone-600"><span>WildTrek service fee</span><span>${fee.toLocaleString()}</span></div>
      <div className="flex justify-between font-semibold text-stone-900"><span>Total</span><span>${total.toLocaleString()}</span></div>
      <p className="text-[11px] text-stone-500">Guide tip (15–20%) is customary and paid directly.</p>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1 block text-xs font-semibold text-stone-700">{label}</span>{children}</label>
}

function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between"><dt className="text-stone-500">{k}</dt><dd className="font-medium text-stone-900">{v}</dd></div>
}
