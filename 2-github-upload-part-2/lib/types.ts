export type Activity = "fishing" | "hunting" | "outdoors"

export type RegionId = "coastal-bend" | "upper-coast" | "lower-coast" | "hill-country" | "east-texas" | "south-texas" | "west-texas" | "panhandle"

export interface Region {
  id: RegionId
  name: string
  blurb: string
}

export interface TripPackage {
  id: string
  name: string
  hours: number
  price: number
  maxGuests: number
  includes: string[]
}

export interface Review {
  author: string
  date: string
  rating: number
  text: string
  trip?: string
}

export interface Guide {
  id: string
  name: string
  business: string
  activity: Activity
  disciplines: string[]
  region: RegionId
  homeBase: string
  locationSlug?: string
  species: string[]
  rating: number
  reviewCount: number
  yearsExperience: number
  verified: boolean
  licenses: string[]
  boat?: string
  bio: string
  highlights: string[]
  packages: TripPackage[]
  reviews: Review[]
  languages: string[]
  responseTime: string
  /** Avatar art: two-letter monogram tint */
  tint: "pine" | "gulf" | "blaze" | "sand" | "dusk"
}

export type SpeciesKind = "saltwater" | "freshwater" | "big-game" | "upland" | "waterfowl" | "small-game"

/** 0 = poor, 1 = fair, 2 = good, 3 = peak — one value per month Jan..Dec */
export type MonthRating = [number, number, number, number, number, number, number, number, number, number, number, number]

export interface Species {
  slug: string
  name: string
  aka: string[]
  scientific: string
  kind: SpeciesKind
  activity: "fishing" | "hunting"
  summary: string
  identify: string[]
  habitat: string
  behavior: string
  months: MonthRating
  techniques: { name: string; detail: string }[]
  baits: string[]
  gear: string
  proTips: string[]
  regulation?: { summary: string; source: string }
  stateRecord?: string
  avgSize: string
  regions: RegionId[]
  related: string[]
}

export interface Location {
  slug: string
  name: string
  region: RegionId
  lat: number
  lon: number
  type: "bay" | "offshore" | "surf" | "lake" | "river" | "ranch" | "marsh" | "public-land"
  activity: Activity
  tideStation?: { id: string; name: string }
  summary: string
  species: string[]
  access: string[]
  bestMonths: string
  hazards: string[]
  tips: string[]
}

export interface SeasonWindow {
  label: string
  start: string // YYYY-MM-DD
  end: string
}

export interface HuntSeason {
  id: string
  game: string
  speciesSlug?: string
  zone: string
  type: string
  windows: SeasonWindow[]
  notes?: string
}

export interface Article {
  slug: string
  title: string
  category: "Tips & Tricks" | "Gear Guide" | "Location Spotlight" | "Species Guide" | "Hunting Prep" | "Safety"
  activity: Activity
  author: string
  authorRole: string
  date: string
  readMinutes: number
  excerpt: string
  body: { heading?: string; text: string }[]
  tags: string[]
}
