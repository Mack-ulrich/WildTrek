import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const guideId = searchParams.get("guideId")
  if (!guideId) return NextResponse.json({ reviews: [] })

  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: (cs) => cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } }
    )
    const { data: reviews } = await supabase
      .from("reviews")
      .select("*, profiles(full_name, avatar_url)")
      .eq("guide_id", guideId)
      .order("created_at", { ascending: false })

    return NextResponse.json({ reviews: reviews || [] })
  } catch {
    return NextResponse.json({ reviews: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: (cs) => cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } }
    )
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { bookingId, guideId, rating, comment } = await request.json()
    const { data: review, error } = await supabase
      .from("reviews")
      .insert([{ booking_id: bookingId, guide_id: guideId, customer_id: user.id, rating, comment, is_verified: true }])
      .select().single()

    if (error) throw error

    // Update guide rating
    const { data: reviews } = await supabase.from("reviews").select("rating").eq("guide_id", guideId)
    if (reviews?.length) {
      const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      await supabase.from("guides").update({ rating: Math.round(avg * 10) / 10, total_reviews: reviews.length }).eq("id", guideId)
    }

    return NextResponse.json({ review }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
