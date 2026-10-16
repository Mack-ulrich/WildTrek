"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/supabase"
import type { User, Session, AuthError } from "@supabase/supabase-js"

type Role = AuthUser["role"]

/** Shape used before (or without) a profiles row: built from the auth user and its sign-up metadata. */
function fromAuthUser(u: User): AuthUser {
  const meta = u.user_metadata ?? {}
  return {
    id: u.id,
    email: u.email ?? "",
    name: meta.full_name ?? meta.name ?? "",
    role: (meta.role === "guide" ? "guide" : "customer") as Role,
    phone: meta.phone,
    location: meta.location,
    created_at: u.created_at,
    updated_at: u.updated_at ?? u.created_at,
  }
}

interface AuthUser {
  id: string
  email: string
  name: string
  role: "customer" | "guide" | "outfitter" | "admin"
  avatar_url?: string
  phone?: string
  location?: string
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: AuthUser | null
  session: Session | null
  loading: boolean
  signUp: (
    email: string,
    password: string,
    userData: { name: string; phone?: string; location?: string },
  ) => Promise<{ user: User | null; error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: AuthError | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
  updateProfile: (updates: Partial<AuthUser>) => Promise<{ error: Error | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // FIXED: null guard for when Supabase env vars are missing
    if (!supabase || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.warn("Supabase not configured - authentication disabled")
      setLoading(false)
      return
    }

    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Error getting session:", error)
          setLoading(false)
          return
        }

        setSession(session)

        if (session?.user) {
          setUser(fromAuthUser(session.user))
          await fetchUserProfile(session.user)
        }
      } catch (error) {
        console.error("Error in getInitialSession:", error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)

      if (session?.user) {
        setUser((prev) => (prev?.id === session.user.id ? prev : fromAuthUser(session.user)))
        await fetchUserProfile(session.user)
      } else {
        setUser(null)
      }

      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Profiles are created by the on_auth_user_created trigger (database-schema.sql).
  const fetchUserProfile = async (authUser: User) => {
    if (!supabase) return

    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", authUser.id).maybeSingle()

      if (error) {
        console.error("Error fetching user profile:", error)
        return
      }

      if (data) {
        const base = fromAuthUser(authUser)
        setUser({
          ...base,
          name: data.full_name ?? base.name,
          role: data.role ?? base.role,
          avatar_url: data.avatar_url ?? undefined,
          phone: data.contact_number ?? base.phone,
          created_at: data.created_at ?? base.created_at,
          updated_at: data.updated_at ?? base.updated_at,
        })
      }
    } catch (error) {
      console.error("Error in fetchUserProfile:", error)
    }
  }

  const signUp = async (
    email: string,
    password: string,
    userData: { name: string; phone?: string; location?: string },
  ) => {
    if (!supabase) {
      return { user: null, error: new Error("Supabase not configured") as AuthError }
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.name,
            phone: userData.phone,
            location: userData.location,
          },
        },
      })

      if (error) {
        return { user: null, error }
      }

      return { user: data.user, error: null }
    } catch (error) {
      console.error("Error in signUp:", error)
      return { user: null, error: error as AuthError }
    }
  }

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      return { user: null, error: new Error("Supabase not configured") as AuthError }
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      return { user: data.user, error }
    } catch (error) {
      console.error("Error in signIn:", error)
      return { user: null, error: error as AuthError }
    }
  }

  const signOut = async () => {
    if (!supabase) return

    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("Error signing out:", error)
      }
      setUser(null)
      setSession(null)
    } catch (error) {
      console.error("Error in signOut:", error)
    }
  }

  const resetPassword = async (email: string) => {
    if (!supabase) {
      return { error: new Error("Supabase not configured") as AuthError }
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      return { error }
    } catch (error) {
      console.error("Error in resetPassword:", error)
      return { error: error as AuthError }
    }
  }

  const updateProfile = async (updates: Partial<AuthUser>) => {
    if (!supabase || !user) {
      return { error: new Error("No user logged in or Supabase not configured") }
    }

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          ...(updates.name !== undefined && { full_name: updates.name }),
          ...(updates.avatar_url !== undefined && { avatar_url: updates.avatar_url }),
          ...(updates.phone !== undefined && { contact_number: updates.phone }),
        })
        .eq("id", user.id)

      if (error) {
        return { error: new Error(error.message) }
      }

      setUser((prev) => (prev ? { ...prev, ...updates } : null))

      return { error: null }
    } catch (error) {
      console.error("Error in updateProfile:", error)
      return { error: error as Error }
    }
  }

  const value: AuthContextType = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
