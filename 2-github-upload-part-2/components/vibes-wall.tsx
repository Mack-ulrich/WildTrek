"use client"

import { useEffect, useState } from "react"
import { Heart, MessageCircle, Fish, Crosshair, MapPin, Send } from "lucide-react"
import { SPECIES, SPECIES_BY_SLUG } from "@/data/species"
import { LOCATIONS } from "@/data/locations"
import { useLocal, uid } from "@/lib/use-local"
import { useSynced } from "@/lib/use-synced"
import { postFromRow, vibesStore } from "@/lib/sync-stores"
import { useAuth } from "@/auth-context"
import { supabase, supabaseConfigured } from "@/supabase"
import { Monogram } from "@/components/bits"
import { cn } from "@/utils"

export interface Post {
  id: string
  author: string
  role: "angler" | "hunter" | "guide"
  text: string
  species?: string
  size?: string
  location?: string
  likes: number
  liked?: boolean
  comments: number
  createdAt: string
}

const SEED: Post[] = [
  { id: "s1", author: "Capt. Mike Torres", role: "guide", text: "Bull reds stacked on the south jetty this morning. The fall run is ON. Fresh cut mullet on the outgoing tide.", species: "red-drum", size: '38"', location: "port-aransas", likes: 41, comments: 9, createdAt: "2026-10-14T13:20:00Z" },
  { id: "s2", author: "Paige N.", role: "hunter", text: "Opening weekend of archery and my first doe with a bow! Huge thanks to Jessie for the coaching.", species: "white-tailed-deer", location: "hill-country-ranches", likes: 87, comments: 22, createdAt: "2026-10-04T23:05:00Z" },
  { id: "s3", author: "Ray Dupuis", role: "guide", text: "Gulls working all over East Bay. Small trout under the birds, but the keepers are down deep. Let it sink!", species: "spotted-seatrout", location: "galveston", likes: 33, comments: 5, createdAt: "2026-10-12T15:40:00Z" },
  { id: "s4", author: "Brian S.", role: "angler", text: "Lake Fork cooled off and the bass moved up on the points. Lipless crank in red craw.", species: "largemouth-bass", size: "6.4 lb", location: "lake-fork", likes: 28, comments: 3, createdAt: "2026-10-10T21:15:00Z" },
]

export function VibesWall() {
  const { session, user } = useAuth()
  const [mine, setMine] = useSynced(vibesStore)
  const [shared, setShared] = useState<Post[]>([])
  const [likes, setLikes] = useLocal<Record<string, boolean>>("wildtrek.vibes.likes", {})
  const [text, setText] = useState("")
  const [species, setSpecies] = useState("")
  const [size, setSize] = useState("")
  const [location, setLocation] = useState("")
  const [name, setName] = useLocal("wildtrek.name", "")

  // Everyone's posts, once Supabase is connected (vibes_posts is publicly readable).
  useEffect(() => {
    if (!supabaseConfigured) return
    supabase
      .from("vibes_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data, error }) => {
        if (error) console.error("Vibes feed failed:", error)
        else setShared((data ?? []).filter((r) => r.user_id !== session?.user.id).map(postFromRow))
      })
  }, [session?.user.id])

  useEffect(() => {
    if (user?.name) setName((n) => n || user.name)
  }, [user?.name, setName])

  const posts = [...mine, ...shared, ...SEED].sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const post = (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    const sp = species ? SPECIES_BY_SLUG[species] : undefined
    setMine((p) => [{ id: uid(), author: name.trim() || "You", role: user?.role === "guide" ? "guide" : sp?.activity === "hunting" ? "hunter" : "angler", text: text.trim(), species: species || undefined, size: size || undefined, location: location || undefined, likes: 0, comments: 0, createdAt: new Date().toISOString() }, ...p])
    setText(""); setSpecies(""); setSize(""); setLocation("")
  }

  return (
    <div className="space-y-6">
      <form onSubmit={post} className="space-y-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
        <div className="flex gap-3">
          <Monogram name={name || "You"} tint="blaze" size="sm" />
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} placeholder="What's biting? What did you see out there?" className="w-full resize-none rounded-lg bg-stone-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-700" />
        </div>
        <div className="flex flex-wrap gap-2 pl-12">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Display name" className="w-32 rounded-lg border border-stone-200 px-2 py-1.5 text-xs" />
          <select value={species} onChange={(e) => setSpecies(e.target.value)} className="rounded-lg border border-stone-200 px-2 py-1.5 text-xs">
            <option value="">Species</option>
            {SPECIES.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
          </select>
          <input value={size} onChange={(e) => setSize(e.target.value)} placeholder='Size (e.g. 24")' className="w-28 rounded-lg border border-stone-200 px-2 py-1.5 text-xs" />
          <select value={location} onChange={(e) => setLocation(e.target.value)} className="rounded-lg border border-stone-200 px-2 py-1.5 text-xs">
            <option value="">Spot</option>
            {LOCATIONS.map((l) => <option key={l.slug} value={l.slug}>{l.name}</option>)}
          </select>
          <button className="ml-auto flex items-center gap-1.5 rounded-lg bg-emerald-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-900 disabled:opacity-40" disabled={!text.trim()}>
            <Send className="h-3.5 w-3.5" />Post
          </button>
        </div>
      </form>

      {posts.map((p) => {
        const sp = p.species ? SPECIES_BY_SLUG[p.species] : undefined
        const liked = likes[p.id]
        const ago = timeAgo(p.createdAt)
        return (
          <article key={p.id} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <Monogram name={p.author} tint={p.role === "guide" ? "pine" : p.role === "hunter" ? "blaze" : "gulf"} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-x-2 text-sm">
                  <span className="font-semibold text-stone-900">{p.author}</span>
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase", p.role === "guide" ? "bg-emerald-100 text-emerald-800" : "bg-stone-100 text-stone-600")}>{p.role}</span>
                  <span className="text-xs text-stone-500">{ago}</span>
                </p>
                <p className="mt-2 text-[15px] leading-relaxed text-stone-800">{p.text}</p>
                {(sp || p.location) && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {sp && (
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-900">
                        {sp.activity === "hunting" ? <Crosshair className="h-3.5 w-3.5" /> : <Fish className="h-3.5 w-3.5" />}{sp.name}{p.size && ` · ${p.size}`}
                      </span>
                    )}
                    {p.location && <span className="inline-flex items-center gap-1 rounded-lg bg-stone-100 px-2.5 py-1 text-xs text-stone-700"><MapPin className="h-3.5 w-3.5" />{LOCATIONS.find((l) => l.slug === p.location)?.name}</span>}
                  </div>
                )}
                <div className="mt-4 flex gap-5 border-t border-stone-100 pt-3 text-sm text-stone-500">
                  <button onClick={() => setLikes((l) => ({ ...l, [p.id]: !liked }))} className={cn("flex items-center gap-1.5 transition", liked ? "text-red-600" : "hover:text-red-500")}>
                    <Heart className={cn("h-4 w-4", liked && "fill-current")} />{p.likes + (liked ? 1 : 0)}
                  </button>
                  <span className="flex items-center gap-1.5"><MessageCircle className="h-4 w-4" />{p.comments}</span>
                </div>
              </div>
            </div>
          </article>
        )
      })}
      <p className="text-center text-xs text-stone-500">
        {!supabaseConfigured
          ? "Your posts are saved on this device. Sign-in and a shared community feed arrive when accounts go live."
          : session
            ? "Your posts are shared with the WildTrek community."
            : "Your posts are saved on this device. Sign in to share them with everyone."}
      </p>
    </div>
  )
}

function timeAgo(iso: string) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000
  if (s < 60) return "just now"
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  if (s < 86400 * 30) return `${Math.floor(s / 86400)}d ago`
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}
