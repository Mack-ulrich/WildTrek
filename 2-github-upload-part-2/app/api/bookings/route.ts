import { NextRequest, NextResponse } from "next/server"
import { adminClient, requestClient, requestUser } from "@/lib/supabase-server"
import { bookingFromRow, bookingRow, bookingSchema } from "@/lib/booking-row"

export async function GET(request: NextRequest) {
  try {
    const supabase = await requestClient(request)
    if (!supabase) return NextResponse.json({ bookings: [], source: "local" })
    const user = await requestUser(supabase, request)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false })

    if (error) throw error
    return NextResponse.json({ bookings: (data ?? []).map(bookingFromRow) })
  } catch (error) {
    console.error("GET /api/bookings error:", error)
    return NextResponse.json({ bookings: [] })
  }
}

/** Accepts the BookingWidget payload (components/booking-widget.tsx Booking). */
export async function POST(request: NextRequest) {
  const parsed = bookingSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Invalid booking", issues: parsed.error.issues }, { status: 400 })
  const booking = { ...parsed.data, status: "requested" as const }

  try {
    const supabase = await requestClient(request)
    // No database yet: the widget already saved the request on the device.
    if (!supabase) return NextResponse.json({ booking, source: "local" }, { status: 202 })

    const user = await requestUser(supabase, request)
    const row = { ...bookingRow(booking), client_id: booking.id }

    if (user) {
      const { data, error } = await supabase
        .from("bookings")
        .upsert({ ...row, customer_id: user.id }, { onConflict: "customer_id,client_id" })
        .select()
        .single()
      if (error) throw error
      return NextResponse.json({ booking: bookingFromRow(data), source: "supabase" }, { status: 201 })
    }

    // Guest request: only the service role may write rows without a customer.
    const admin = adminClient()
    if (!admin) return NextResponse.json({ error: "Sign in to send trip requests" }, { status: 401 })
    const { data, error } = await admin.from("bookings").insert({ ...row, customer_id: null }).select().single()
    if (error) throw error
    return NextResponse.json({ booking: bookingFromRow(data), source: "supabase" }, { status: 201 })
  } catch (error: any) {
    console.error("POST /api/bookings error:", error)
    return NextResponse.json({ error: error?.message ?? "Server error" }, { status: 500 })
  }
}
