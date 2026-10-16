"use client"

import { useEffect, useState } from "react"
import { CloudUpload, X } from "lucide-react"
import { useAuth } from "@/auth-context"
import { supabaseConfigured } from "@/supabase"
import { SYNCED_STORES } from "@/lib/sync-stores"
import { SYNC_EVENT } from "@/lib/use-synced"
import { useToast } from "@/use-toast"

const readLocal = (key: string) => {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : undefined
  } catch {
    return undefined
  }
}

/**
 * After sign-in, offers to copy what this device saved while signed out into the account.
 * Asks again only if the device's data changes after an upload or a "Not now".
 */
export function SyncPrompt() {
  const { session } = useAuth()
  const { toast } = useToast()
  const userId = supabaseConfigured ? session?.user.id : undefined
  const [pending, setPending] = useState<{ signature: string; summary: string } | null>(null)
  const [busy, setBusy] = useState(false)

  const flagKey = `wildtrek.synced.${userId}`

  useEffect(() => {
    if (!userId) return setPending(null)
    const values = SYNCED_STORES.map(({ store }) => readLocal(store.key) ?? store.initial)
    const parts = SYNCED_STORES.map(({ label, size }, i) => ({ n: size(values[i]), label })).filter((p) => p.n > 0)
    const signature = JSON.stringify(values)
    if (!parts.length || readLocal(flagKey) === signature) return setPending(null)
    setPending({ signature, summary: parts.map((p) => `${p.n} ${p.label}${p.n === 1 ? "" : "s"}`).join(", ") })
  }, [userId, flagKey])

  if (!userId || !pending) return null

  const remember = () => {
    try {
      window.localStorage.setItem(flagKey, JSON.stringify(pending.signature))
    } catch {}
    setPending(null)
  }

  const upload = async () => {
    setBusy(true)
    try {
      for (const { store } of SYNCED_STORES) {
        const local = readLocal(store.key)
        if (local !== undefined && !store.remote.isEmpty(local)) await store.remote.upload(userId, local)
      }
      remember()
      window.dispatchEvent(new Event(SYNC_EVENT))
      toast({ title: "Synced to your account", description: "Your trips, logbook, gear and posts now follow you to any device." })
    } catch (err: any) {
      toast({ title: "Upload failed", description: err?.message ?? "Try again in a moment.", variant: "destructive" })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div role="dialog" aria-label="Upload saved data" className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-lg rounded-2xl border border-emerald-200 bg-white p-4 shadow-xl">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-800"><CloudUpload className="h-5 w-5" /></span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-stone-900">Add this device&apos;s data to your account?</p>
          <p className="mt-0.5 text-sm text-stone-600">Found {pending.summary} saved here before you signed in.</p>
          <div className="mt-3 flex gap-2">
            <button onClick={upload} disabled={busy} className="rounded-lg bg-emerald-800 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-900 disabled:opacity-60">{busy ? "Uploading…" : "Upload"}</button>
            <button onClick={remember} disabled={busy} className="rounded-lg px-3 py-1.5 text-sm font-medium text-stone-600 hover:bg-stone-100">Not now</button>
          </div>
        </div>
        <button onClick={remember} aria-label="Dismiss" className="text-stone-400 hover:text-stone-600"><X className="h-4 w-4" /></button>
      </div>
    </div>
  )
}
