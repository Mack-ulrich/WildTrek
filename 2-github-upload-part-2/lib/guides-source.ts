import { cache } from "react"
import { GUIDES } from "@/data/guides"
import { publicClient } from "@/lib/supabase-server"
import type { Guide } from "@/lib/types"

type GuideRow = Record<string, any>

/** guides row -> Guide. `listing` (JSONB) holds the app's Guide fields; columns fill the gaps. */
export function guideFromRow(r: GuideRow): Guide {
  const p: Partial<Guide> = r.listing ?? {}
  const hourly = Number(r.price_per_hour ?? 150)
  return {
    id: r.slug ?? r.id,
    name: p.name ?? r.profiles?.full_name ?? r.business_name ?? "WildTrek guide",
    business: r.business_name ?? p.business ?? p.name ?? "WildTrek guide",
    activity: p.activity ?? "fishing",
    disciplines: p.disciplines ?? r.specialties ?? [],
    region: p.region ?? "coastal-bend",
    homeBase: p.homeBase ?? r.location ?? "Texas",
    locationSlug: p.locationSlug,
    species: p.species ?? [],
    rating: Number(r.rating ?? p.rating ?? 0),
    reviewCount: Number(r.total_reviews ?? p.reviewCount ?? 0),
    yearsExperience: Number(r.years_experience ?? p.yearsExperience ?? 0),
    verified: Boolean(r.is_verified),
    licenses: p.licenses ?? (r.license_number ? [String(r.license_number)] : []),
    boat: p.boat,
    bio: p.bio ?? r.description ?? "",
    highlights: p.highlights ?? [],
    packages: p.packages?.length
      ? p.packages
      : [{ id: "half", name: "Half-Day Trip", hours: 4, price: hourly * 4, maxGuests: Number(r.max_group_size ?? 4), includes: [] }],
    reviews: p.reviews ?? [],
    languages: p.languages ?? ["English"],
    responseTime: p.responseTime ?? "Usually replies within a day",
    tint: p.tint ?? "pine",
  }
}

/**
 * Guides shown on detail pages: approved rows from Supabase once there are any,
 * otherwise the built-in listings in data/guides.ts.
 */
export const getGuides = cache(async (): Promise<Guide[]> => {
  const supabase = publicClient()
  if (!supabase) return GUIDES
  try {
    const { data, error } = await supabase.from("guides").select("*, profiles(full_name)").eq("is_approved", true)
    if (error) throw error
    return data?.length ? data.map(guideFromRow) : GUIDES
  } catch (err) {
    console.error("Loading guides from Supabase failed, using built-in listings:", err)
    return GUIDES
  }
})

export const getGuide = cache(async (id: string) => (await getGuides()).find((g) => g.id === id))
