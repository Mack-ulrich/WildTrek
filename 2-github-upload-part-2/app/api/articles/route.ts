import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category")
  const page = Number(searchParams.get("page") || "1")
  const limit = Number(searchParams.get("limit") || "12")

  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: (cs) => cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } }
    )
    let query = supabase
      .from("articles")
      .select("*, profiles(full_name, avatar_url)", { count: "exact" })
      .eq("published", true)
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (category) query = query.eq("category", category)
    const { data: articles, count } = await query
    return NextResponse.json({ articles: articles || [], total: count || 0, page, limit })
  } catch {
    return NextResponse.json({ articles: [], total: 0 })
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

    const body = await request.json()
    const { data: article, error } = await supabase
      .from("articles")
      .insert([{ ...body, author_id: user.id, published: false }])
      .select().single()

    if (error) throw error
    return NextResponse.json({ article }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
