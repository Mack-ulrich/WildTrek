"use client"

import Link from "next/link"
import { CalendarDays, Fish, NotebookPen, Backpack, X } from "lucide-react"
import { useAuth } from "@/auth-context"
import { useSynced } from "@/lib/use-synced"
import { bookingsStore, gearStore, logbookStore } from "@/lib/sync-stores"
import type { Booking } from "@/components/booking-widget"
import { SPECIES_BY_SLUG } from "@/data/species"
import { GUIDE_BY_ID } from "@/data/guides"
import { ConditionsBoard } from "@/components/conditions-board"
import { cn } from "@/utils"

export default function DashboardPage() {
  const { user } = useAuth()
  const [bookings, setBookings, ready] = useSynced(bookingsStore)
  const [log] = useSynced(logbookStore)
  const [gear] = useSynced(gearStore)

  const today = new Date().toLocaleDateString("en-CA")
  const upcoming = bookings.filter((b) => b.date >= today && b.status !== "cancelled").sort((a, b) => a.date.localeCompare(b.date))
  const past = bookings.filter((b) => b.date < today || b.status === "cancelled")
  const next = upcoming[0]
  const daysOut = next ? Math.round((new Date(next.date + "T12:00").getTime() - new Date(today + "T12:00").getTime()) / 86400000) : null

  const cancel = (id: string) => {
    if (confirm("Cancel this trip request?")) setBookings((p) => p.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b)))
  }

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">Dashboard</p>
          <h1 className="text-4xl font-bold">{user ? `Welcome back, ${user.name || user.email.split("@")[0]}` : "Your trips & tools"}</h1>
          {!user && <p className="mt-1 text-sm text-stone-600">Saved on this device. <Link href="/auth/register" className="font-semibold text-emerald-800 hover:underline">Create an account</Link> to sync everywhere.</p>}
        </div>
        <Link href="/guides" className="rounded-xl bg-orange-600 px-5 py-2.5 font-semibold text-white hover:bg-orange-700">Book a trip</Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Tile icon={CalendarDays} label="Next trip" value={next ? (daysOut === 0 ? "Today!" : `${daysOut} day${daysOut === 1 ? "" : "s"}`) : "—"} sub={next?.business} />
        <Tile icon={Fish} label="Trips requested" value={String(bookings.length)} />
        <Tile icon={NotebookPen} label="Logbook entries" value={String(log.length)} sub={log[0] ? `Last: ${SPECIES_BY_SLUG[log[0].species]?.name}` : undefined} href="/logbook" />
        <Tile icon={Backpack} label="Gear items packed" value={String(Object.values(gear).filter(Boolean).length)} href="/gear" />
      </div>

      <section>
        <h2 className="mb-4 text-3xl font-bold">Upcoming trips</h2>
        {ready && upcoming.length === 0 && (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center">
            <p className="font-display text-2xl font-bold">No trips on the calendar</p>
            <p className="mt-1 text-sm text-stone-600">Find a guide and request a date. It takes about a minute.</p>
            <Link href="/guides" className="mt-4 inline-block rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white">Browse guides</Link>
          </div>
        )}
        <div className="space-y-3">
          {upcoming.map((b) => <TripRow key={b.id} b={b} onCancel={() => cancel(b.id)} />)}
        </div>
      </section>

      {next && (
        <section>
          <h2 className="mb-4 text-3xl font-bold">Conditions for your next trip</h2>
          <ConditionsBoard key={next.id} compact defaultLoc={GUIDE_BY_ID[next.guideId]?.locationSlug ?? "port-aransas"} />
        </section>
      )}

      {past.length > 0 && (
        <section>
          <h2 className="mb-4 text-2xl font-bold">Past & cancelled</h2>
          <div className="space-y-3">{past.map((b) => <TripRow key={b.id} b={b} />)}</div>
        </section>
      )}
    </div>
  )
}

function TripRow({ b, onCancel }: { b: Booking; onCancel?: () => void }) {
  const d = new Date(b.date + "T12:00")
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-4">
      <div className="w-16 shrink-0 rounded-xl bg-emerald-900 py-2 text-center text-white">
        <p className="text-[10px] font-semibold uppercase">{d.toLocaleDateString("en-US", { month: "short" })}</p>
        <p className="font-display text-2xl font-bold leading-none">{d.getDate()}</p>
      </div>
      <div className="min-w-0 flex-1">
        <Link href={`/guides/${b.guideId}`} className="font-semibold text-stone-900 hover:text-emerald-800">{b.business}</Link>
        <p className="text-sm text-stone-600">{b.packageName} · {b.guests} guest{b.guests > 1 ? "s" : ""} · ${b.total.toLocaleString()}</p>
      </div>
      <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", b.status === "cancelled" ? "bg-red-100 text-red-800" : b.status === "confirmed" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900")}>
        {b.status === "requested" ? "Awaiting guide" : b.status[0].toUpperCase() + b.status.slice(1)}
      </span>
      {onCancel && <button onClick={onCancel} className="text-stone-400 hover:text-red-600" aria-label="Cancel request"><X className="h-4 w-4" /></button>}
    </div>
  )
}

function Tile({ icon: Icon, label, value, sub, href }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; sub?: string; href?: string }) {
  const body = (
    <div className="h-full rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-stone-500"><Icon className="h-4 w-4" />{label}</p>
      <p className="mt-1 font-display text-4xl font-bold">{value}</p>
      {sub && <p className="truncate text-xs text-stone-500">{sub}</p>}
    </div>
  )
  return href ? <Link href={href}>{body}</Link> : body
}
