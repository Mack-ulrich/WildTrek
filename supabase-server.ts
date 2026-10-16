import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { NextRequest } from "next/server"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

export const serverSupabaseConfigured = Boolean(url && anonKey)

/**
 * Supabase client acting as the caller. The browser client keeps its session in localStorage,
 * so callers send `Authorization: Bearer <access token>`; cookie sessions (@supabase/ssr) also work.
 */
export async function requestClient(request: NextRequest): Promise<SupabaseClient | null> {
  if (!serverSupabaseConfigured) return null
  const auth = request.headers.get("authorization")
  if (auth?.toLowerCase().startsWith("bearer ")) {
    return createClient(url, anonKey, {
      global: { headers: { Authorization: auth } },
      auth: { persistSession: false, autoRefreshToken: false },
    })
  }
  const cookieStore = await cookies()
  return createServerClient(url, anonKey, {
    cookies: { getAll: () => cookieStore.getAll(), setAll: (cs) => cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) },
  })
}

/** Signed-in user for this request, or null. */
export async function requestUser(client: SupabaseClient, request: NextRequest) {
  const auth = request.headers.get("authorization")
  const token = auth?.toLowerCase().startsWith("bearer ") ? auth.slice(7) : undefined
  const { data } = await client.auth.getUser(token)
  return data.user
}

/** Service-role client for server-only writes (guest booking requests). Null without the key. */
export function adminClient(): SupabaseClient | null {
  if (!serverSupabaseConfigured || !serviceKey) return null
  return createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
}

/** Anonymous read-only client for public data (approved guides). No cookies, so pages stay static. */
export function publicClient(): SupabaseClient | null {
  if (!serverSupabaseConfigured) return null
  return createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } })
}
