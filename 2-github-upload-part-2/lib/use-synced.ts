"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useAuth } from "@/auth-context"
import { supabaseConfigured } from "@/supabase"
import { useLocal } from "@/lib/use-local"

/** How one piece of app state is stored in Supabase for a signed-in user. */
export interface RemoteStore<T> {
  load(userId: string): Promise<T>
  /** Persist the change from prev to next (diff-based for lists). */
  save(userId: string, prev: T, next: T): Promise<void>
  /** Copy this device's data into the account without dropping anything already there. */
  upload(userId: string, local: T): Promise<void>
  isEmpty(value: T): boolean
}

export interface Synced<T> {
  key: string
  initial: T
  remote: RemoteStore<T>
}

/** Fired after local data is uploaded so mounted hooks reload from Supabase. */
export const SYNC_EVENT = "wildtrek:synced"

/**
 * Same contract as useLocal, but when Supabase is configured and a user is signed in,
 * reads and writes go to their account. Signed out (or no env vars) it is plain localStorage.
 * The localStorage copy is left untouched while signed in so it stays this device's data.
 */
export function useSynced<T>({ key, initial, remote }: Synced<T>) {
  const { session, loading } = useAuth()
  const userId = supabaseConfigured ? session?.user.id : undefined
  const [local, setLocal, localReady] = useLocal<T>(key, initial)

  const [value, setValue] = useState<T>(initial)
  const [remoteReady, setRemoteReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const current = useRef<T>(initial)
  const initialRef = useRef(initial)
  const remoteRef = useRef(remote)
  remoteRef.current = remote

  useEffect(() => {
    if (!userId) return
    let live = true
    const load = () =>
      remoteRef.current
        .load(userId)
        .then((v) => {
          if (!live) return
          current.current = v
          setValue(v)
          setFailed(false)
          setRemoteReady(true)
        })
        .catch((err) => {
          // Tables missing or offline: keep the app usable on this device's data.
          console.error(`Supabase load failed for ${key}:`, err)
          if (live) setFailed(true)
        })
    setRemoteReady(false)
    current.current = initialRef.current
    setValue(initialRef.current)
    load()
    window.addEventListener(SYNC_EVENT, load)
    return () => {
      live = false
      window.removeEventListener(SYNC_EVENT, load)
    }
  }, [userId, key])

  const updateRemote = useCallback(
    (next: T | ((prev: T) => T)) => {
      if (!userId) return
      const prev = current.current
      const v = typeof next === "function" ? (next as (p: T) => T)(prev) : next
      current.current = v
      setValue(v)
      remoteRef.current.save(userId, prev, v).catch((err) => console.error(`Supabase save failed for ${key}:`, err))
    },
    [userId, key],
  )

  if (!userId || failed) return [local, setLocal, localReady && !loading] as const
  return [value, updateRemote, remoteReady] as const
}
