import { createClient, type SupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

const isConfigured = Boolean(supabaseUrl && supabaseAnonKey)

/** True once NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set. */
export const supabaseConfigured = isConfigured

// Client-side Supabase client (null when env vars missing)
export const supabase: SupabaseClient = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (null as unknown as SupabaseClient)

// Server-side Supabase client with service role key
export const supabaseAdmin: SupabaseClient =
  isConfigured && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : (null as unknown as SupabaseClient)

// Auth functions
export const signUp = async (email: string, password: string, userData?: any) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData,
    },
  })
  return { data, error }
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  return { user, error }
}

// Database functions
export const createProfile = async (userId: string, profileData: any) => {
  const { data, error } = await supabase
    .from("profiles")
    .insert([{ id: userId, ...profileData }])
    .select()
  return { data, error }
}

export const getProfile = async (userId: string) => {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()
  return { data, error }
}

export const updateProfile = async (userId: string, updates: any) => {
  const { data, error } = await supabase.from("profiles").update(updates).eq("id", userId).select()
  return { data, error }
}

// Guide functions
export const getGuides = async (filters?: any) => {
  let query = supabase.from("guides").select(`
      *,
      profiles (
        full_name,
        avatar_url
      )
    `)

  if (filters?.location) {
    query = query.ilike("location", `%${filters.location}%`)
  }

  if (filters?.specialty) {
    query = query.contains("specialties", [filters.specialty])
  }

  const { data, error } = await query
  return { data, error }
}

export const getGuide = async (guideId: string) => {
  const { data, error } = await supabase
    .from("guides")
    .select(`
      *,
      profiles (
        full_name,
        avatar_url
      ),
      reviews (
        id,
        rating,
        comment,
        created_at,
        profiles (
          full_name,
          avatar_url
        )
      )
    `)
    .eq("id", guideId)
    .single()
  return { data, error }
}

// Booking functions
export const createBooking = async (bookingData: any) => {
  const { data, error } = await supabase.from("bookings").insert([bookingData]).select()
  return { data, error }
}

export const getBookings = async (userId: string, userType: "customer" | "guide") => {
  const column = userType === "customer" ? "customer_id" : "guide_id"
  const { data, error } = await supabase
    .from("bookings")
    .select(`
      *,
      guides (
        business_name,
        location
      ),
      profiles!customer_id (
        full_name,
        avatar_url
      )
    `)
    .eq(column, userId)
    .order("trip_date", { ascending: false })
  return { data, error }
}

// Review functions
export const createReview = async (reviewData: any) => {
  const { data, error } = await supabase.from("reviews").insert([reviewData]).select()
  return { data, error }
}

export const getReviews = async (guideId: string) => {
  const { data, error } = await supabase
    .from("reviews")
    .select(`
      *,
      profiles (
        full_name,
        avatar_url
      )
    `)
    .eq("guide_id", guideId)
    .order("created_at", { ascending: false })
  return { data, error }
}

// File upload functions
export const uploadFile = async (bucket: string, path: string, file: File) => {
  const { data, error } = await supabase.storage.from(bucket).upload(path, file)
  return { data, error }
}

export const getFileUrl = (bucket: string, path: string) => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

// Real-time subscriptions
export const subscribeToBookings = (userId: string, callback: (payload: any) => void) => {
  return supabase
    .channel("bookings")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "bookings",
        filter: `customer_id=eq.${userId}`,
      },
      callback,
    )
    .subscribe()
}

export default supabase
