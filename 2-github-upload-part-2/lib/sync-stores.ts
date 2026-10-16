import { supabase } from "@/supabase"
import type { Booking } from "@/components/booking-widget"
import type { LogEntry } from "@/components/logbook"
import type { Post } from "@/components/vibes-wall"
import { bookingFromRow, bookingRow } from "@/lib/booking-row"
import type { RemoteStore, Synced } from "@/lib/use-synced"

type Row = Record<string, unknown>

/**
 * A list of `{ id }` records kept in a table with (owner column, client_id) unique,
 * where client_id is the record's app id. Saves upsert changed rows and delete removed ones.
 */
function listStore<T extends { id: string }>(opts: {
  table: string
  owner: string
  order: string
  toRow: (item: T) => Row
  fromRow: (row: Row) => T
  /** Lists the user can only append to / update (e.g. bookings are cancelled, never deleted). */
  noDelete?: boolean
}): RemoteStore<T[]> {
  const upsert = async (userId: string, items: T[]) => {
    if (!items.length) return
    const rows = items.map((i) => ({ ...opts.toRow(i), [opts.owner]: userId, client_id: i.id }))
    const { error } = await supabase.from(opts.table).upsert(rows, { onConflict: `${opts.owner},client_id` })
    if (error) throw error
  }
  return {
    async load(userId) {
      const { data, error } = await supabase.from(opts.table).select("*").eq(opts.owner, userId).order(opts.order, { ascending: false })
      if (error) throw error
      return (data ?? []).map(opts.fromRow)
    },
    async save(userId, prev, next) {
      const before = new Map(prev.map((i) => [i.id, JSON.stringify(i)]))
      await upsert(userId, next.filter((i) => before.get(i.id) !== JSON.stringify(i)))
      if (opts.noDelete) return
      const kept = new Set(next.map((i) => i.id))
      const gone = prev.filter((i) => !kept.has(i.id)).map((i) => i.id)
      if (gone.length) {
        const { error } = await supabase.from(opts.table).delete().eq(opts.owner, userId).in("client_id", gone)
        if (error) throw error
      }
    },
    upload: upsert,
    isEmpty: (v) => v.length === 0,
  }
}

const num = (v: unknown) => (v === null || v === undefined ? undefined : Number(v))
const str = (v: unknown) => (v === null || v === undefined ? undefined : String(v))

export const bookingsStore: Synced<Booking[]> = {
  key: "wildtrek.bookings",
  initial: [],
  remote: listStore<Booking>({
    table: "bookings",
    owner: "customer_id",
    order: "created_at",
    noDelete: true,
    toRow: bookingRow,
    fromRow: bookingFromRow,
  }),
}

export const logbookStore: Synced<LogEntry[]> = {
  key: "wildtrek.logbook",
  initial: [],
  remote: listStore<LogEntry>({
    table: "logbook_entries",
    owner: "user_id",
    order: "entry_date",
    toRow: (e) => ({
      entry_date: e.date,
      species: e.species,
      location: e.location,
      length: e.length ?? null,
      weight: e.weight ?? null,
      count: e.count,
      kept: e.kept,
      method: e.method,
      notes: e.notes,
      moon: e.moon,
    }),
    fromRow: (r) => ({
      id: String(r.client_id),
      date: String(r.entry_date),
      species: String(r.species),
      location: String(r.location),
      length: num(r.length),
      weight: num(r.weight),
      count: Number(r.count ?? 1),
      kept: Boolean(r.kept),
      method: String(r.method ?? ""),
      notes: String(r.notes ?? ""),
      moon: String(r.moon ?? ""),
    }),
  }),
}

export const vibeRow = (p: Post): Row => ({
  content: p.text,
  author_name: p.author,
  author_role: p.role,
  catch_species: p.species ?? null,
  size: p.size ?? null,
  location: p.location ?? null,
  likes: p.likes,
  comments: p.comments,
  created_at: p.createdAt,
})

export const postFromRow = (r: Row): Post => ({
  id: String(r.client_id ?? r.id),
  author: String(r.author_name ?? "Angler"),
  role: (r.author_role ?? "angler") as Post["role"],
  text: String(r.content ?? ""),
  species: str(r.catch_species),
  size: str(r.size),
  location: str(r.location),
  likes: Number(r.likes ?? 0),
  comments: Number(r.comments ?? 0),
  createdAt: String(r.created_at),
})

/** The signed-in user's own posts. The shared feed is read separately in VibesWall. */
export const vibesStore: Synced<Post[]> = {
  key: "wildtrek.vibes",
  initial: [],
  remote: listStore<Post>({ table: "vibes_posts", owner: "user_id", order: "created_at", toRow: vibeRow, fromRow: postFromRow }),
}

type Checked = Record<string, boolean>

export const gearStore: Synced<Checked> = {
  key: "wildtrek.gear",
  initial: {},
  remote: {
    async load(userId) {
      const { data, error } = await supabase.from("gear_checks").select("checked").eq("user_id", userId).maybeSingle()
      if (error) throw error
      return (data?.checked as Checked) ?? {}
    },
    async save(userId, _prev, next) {
      const { error } = await supabase.from("gear_checks").upsert({ user_id: userId, checked: next })
      if (error) throw error
    },
    async upload(userId, local) {
      const existing = await this.load(userId)
      await this.save(userId, existing, { ...existing, ...Object.fromEntries(Object.entries(local).filter(([, on]) => on)) })
    },
    isEmpty: (v) => !Object.values(v).some(Boolean),
  },
}

const size = (v: unknown[] | Checked) => (Array.isArray(v) ? v.length : Object.values(v).filter(Boolean).length)

/** Everything offered for upload on first sign-in. */
export const SYNCED_STORES: { label: string; store: Synced<any>; size: (v: any) => number }[] = [
  { label: "trip request", store: bookingsStore, size },
  { label: "logbook entry", store: logbookStore, size },
  { label: "packed gear item", store: gearStore, size },
  { label: "Vibes post", store: vibesStore, size },
]
