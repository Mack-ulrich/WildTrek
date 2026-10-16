import { z } from "zod"
import type { Booking } from "@/components/booking-widget"

/** The BookingWidget payload, as accepted by /api/bookings. */
export const bookingSchema = z.object({
  id: z.string().min(1).max(64),
  guideId: z.string().min(1).max(120),
  guideName: z.string().max(200),
  business: z.string().max(200),
  packageName: z.string().max(200),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  guests: z.number().int().min(1).max(50),
  total: z.number().min(0),
  name: z.string().min(1).max(200),
  email: z.string().email().max(320),
  notes: z.string().max(4000),
  createdAt: z.string(),
  status: z.enum(["requested", "confirmed", "completed", "cancelled"]),
})

/** Booking (components/booking-widget.tsx) -> bookings row (database-schema.sql). */
export function bookingRow(b: Booking): Record<string, unknown> {
  return {
    guide_slug: b.guideId,
    guide_name: b.guideName,
    business: b.business,
    package_name: b.packageName,
    trip_date: b.date,
    party_size: b.guests,
    total_amount: b.total,
    contact_name: b.name,
    contact_email: b.email,
    special_requests: b.notes,
    status: b.status,
    created_at: b.createdAt,
  }
}

/** bookings row -> Booking. Guest rows written before client_id existed fall back to the row id. */
export function bookingFromRow(r: Record<string, unknown>): Booking {
  return {
    id: String(r.client_id ?? r.id),
    guideId: String(r.guide_slug ?? ""),
    guideName: String(r.guide_name ?? ""),
    business: String(r.business ?? ""),
    packageName: String(r.package_name ?? ""),
    date: String(r.trip_date),
    guests: Number(r.party_size ?? 1),
    total: Number(r.total_amount ?? 0),
    name: String(r.contact_name ?? ""),
    email: String(r.contact_email ?? ""),
    notes: String(r.special_requests ?? ""),
    createdAt: String(r.created_at),
    status: (r.status === "pending" ? "requested" : r.status) as Booking["status"],
  }
}
