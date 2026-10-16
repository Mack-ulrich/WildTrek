import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { GUIDES, fromPrice } from "@/data/guides"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const location = searchParams.get("location")
    const specialty = searchParams.get("specialty")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const minRating = searchParams.get("minRating")
    const sortBy = searchParams.get("sortBy") || "rating"
    const verifiedOnly = searchParams.get("verifiedOnly") === "true"

    // No database yet: serve the built-in guide listings.
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const guides = GUIDES.filter(
        (g) =>
          (!location || g.homeBase.toLowerCase().includes(location.toLowerCase())) &&
          (!specialty || g.species.includes(specialty) || g.disciplines.includes(specialty)) &&
          (!minPrice || fromPrice(g) >= Number(minPrice)) &&
          (!maxPrice || fromPrice(g) <= Number(maxPrice)) &&
          (!minRating || g.rating >= Number(minRating)) &&
          (!verifiedOnly || g.verified),
      )
      return NextResponse.json({ guides, total: guides.length, source: "seed" })
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: (cs) => cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } }
    )

    let query = supabase
      .from("guides")
      .select("*, profiles(full_name, avatar_url)")
      .eq("is_approved", true)

    if (location) query = query.ilike("location", `%${location}%`)
    if (specialty) query = query.contains("specialties", [specialty])
    if (minPrice) query = query.gte("price_per_hour", Number(minPrice))
    if (maxPrice) query = query.lte("price_per_hour", Number(maxPrice))
    if (minRating) query = query.gte("rating", Number(minRating))
    if (verifiedOnly) query = query.eq("is_verified", true)

    if (sortBy === "price_asc") query = query.order("price_per_hour", { ascending: true })
    else if (sortBy === "price_desc") query = query.order("price_per_hour", { ascending: false })
    else if (sortBy === "reviews") query = query.order("total_reviews", { ascending: false })
    else query = query.order("rating", { ascending: false })

    const { data: guides, error } = await query
    if (error) throw error
    return NextResponse.json({ guides: guides || [], total: guides?.length || 0 })
  } catch (error) {
    return NextResponse.json({ guides: [], total: 0 })
  }
}
