import type { HuntSeason } from "@/lib/types"

/** Source: TPWD 2026–2027 Hunting Season Dates (Outdoor Annual). */
export const SEASON_SOURCE = "https://tpwd.texas.gov/regulations/outdoor-annual/hunting/2026-2027-hunting-season-dates"
export const SEASON_YEAR = "2026–27"

export const HUNT_SEASONS: HuntSeason[] = [
  { id: "wtd-archery", game: "White-tailed Deer", speciesSlug: "white-tailed-deer", zone: "252 of 254 counties", type: "Archery", windows: [{ label: "Archery", start: "2026-10-03", end: "2026-11-06" }], notes: "Archery Endorsement required." },
  { id: "wtd-youth", game: "White-tailed Deer", speciesSlug: "white-tailed-deer", zone: "Statewide", type: "Youth-only", windows: [{ label: "Early youth", start: "2026-10-30", end: "2026-11-01" }, { label: "Late youth", start: "2027-01-04", end: "2027-01-17" }] },
  { id: "wtd-north", game: "White-tailed Deer", speciesSlug: "white-tailed-deer", zone: "North Zone", type: "General", windows: [{ label: "General", start: "2026-11-07", end: "2027-01-03" }, { label: "Special late", start: "2027-01-04", end: "2027-01-17" }] },
  { id: "wtd-south", game: "White-tailed Deer", speciesSlug: "white-tailed-deer", zone: "South Zone", type: "General", windows: [{ label: "General", start: "2026-11-07", end: "2027-01-17" }, { label: "Special late", start: "2027-01-18", end: "2027-01-31" }] },
  { id: "wtd-muzzle", game: "White-tailed Deer", speciesSlug: "white-tailed-deer", zone: "90 of 254 counties", type: "Muzzleloader", windows: [{ label: "Muzzleloader", start: "2027-01-04", end: "2027-01-17" }] },
  { id: "md-panhandle", game: "Mule Deer", speciesSlug: "mule-deer", zone: "Panhandle", type: "General", windows: [{ label: "Archery", start: "2026-10-03", end: "2026-11-20" }, { label: "General", start: "2026-11-21", end: "2026-12-06" }] },
  { id: "md-transpecos", game: "Mule Deer", speciesSlug: "mule-deer", zone: "Trans-Pecos", type: "General", windows: [{ label: "Archery", start: "2026-10-03", end: "2026-11-26" }, { label: "General", start: "2026-11-27", end: "2026-12-13" }] },
  { id: "turkey-fall-north", game: "Turkey (Fall)", speciesSlug: "wild-turkey", zone: "North Zone", type: "General", windows: [{ label: "Archery", start: "2026-10-03", end: "2026-11-06" }, { label: "General", start: "2026-11-07", end: "2027-01-03" }] },
  { id: "turkey-fall-south", game: "Turkey (Fall)", speciesSlug: "wild-turkey", zone: "South Zone", type: "General", windows: [{ label: "Archery", start: "2026-10-03", end: "2026-11-06" }, { label: "General", start: "2026-11-07", end: "2027-01-17" }] },
  { id: "turkey-spring-south", game: "Turkey (Spring)", speciesSlug: "wild-turkey", zone: "South Zone", type: "General", windows: [{ label: "Youth", start: "2027-03-13", end: "2027-03-14" }, { label: "General", start: "2027-03-20", end: "2027-05-02" }] },
  { id: "turkey-spring-north", game: "Turkey (Spring)", speciesSlug: "wild-turkey", zone: "North Zone", type: "General", windows: [{ label: "Youth", start: "2027-03-27", end: "2027-03-28" }, { label: "General", start: "2027-04-03", end: "2027-05-16" }] },
  { id: "turkey-spring-east", game: "Turkey (Spring)", speciesSlug: "wild-turkey", zone: "East (Eastern turkey)", type: "General", windows: [{ label: "General", start: "2027-04-22", end: "2027-05-14" }] },
  { id: "dove-north", game: "Dove", speciesSlug: "mourning-dove", zone: "North Zone", type: "Regular", windows: [{ label: "Split 1", start: "2026-09-01", end: "2026-11-08" }, { label: "Split 2", start: "2026-12-18", end: "2027-01-07" }] },
  { id: "dove-central", game: "Dove", speciesSlug: "mourning-dove", zone: "Central Zone", type: "Regular", windows: [{ label: "Split 1", start: "2026-09-01", end: "2026-10-25" }, { label: "Split 2", start: "2026-12-11", end: "2027-01-14" }] },
  { id: "dove-south", game: "Dove", speciesSlug: "mourning-dove", zone: "South Zone", type: "Regular", windows: [{ label: "Split 1", start: "2026-09-01", end: "2026-10-25" }, { label: "Split 2", start: "2026-12-18", end: "2027-01-21" }] },
  { id: "teal", game: "Teal", speciesSlug: "ducks", zone: "Statewide", type: "September", windows: [{ label: "Teal only", start: "2026-09-19", end: "2026-09-27" }] },
  { id: "duck-south", game: "Ducks", speciesSlug: "ducks", zone: "South Zone", type: "Regular", windows: [{ label: "Youth/Veteran", start: "2026-10-31", end: "2026-11-01" }, { label: "Split 1", start: "2026-11-07", end: "2026-11-29" }, { label: "Split 2", start: "2026-12-12", end: "2027-01-31" }] },
  { id: "duck-north", game: "Ducks", speciesSlug: "ducks", zone: "North Zone", type: "Regular", windows: [{ label: "Youth/Veteran", start: "2026-11-07", end: "2026-11-08" }, { label: "Split 1", start: "2026-11-14", end: "2026-11-29" }, { label: "Split 2", start: "2026-12-05", end: "2027-01-31" }] },
  { id: "duck-hp", game: "Ducks", speciesSlug: "ducks", zone: "High Plains Mallard Mgmt Unit", type: "Regular", windows: [{ label: "Youth/Veteran", start: "2026-10-17", end: "2026-10-18" }, { label: "Split 1", start: "2026-10-24", end: "2026-10-25" }, { label: "Split 2", start: "2026-10-30", end: "2027-01-31" }] },
  { id: "geese-east", game: "Geese", speciesSlug: "snow-goose", zone: "East Zone", type: "Regular", windows: [{ label: "Early Canada", start: "2026-09-12", end: "2026-09-27" }, { label: "Dark geese", start: "2026-11-07", end: "2027-01-31" }, { label: "Light geese", start: "2026-11-07", end: "2027-02-19" }] },
  { id: "geese-west", game: "Geese", speciesSlug: "snow-goose", zone: "West Zone", type: "Regular", windows: [{ label: "Dark & light geese", start: "2026-11-07", end: "2027-02-07" }] },
  { id: "quail", game: "Quail", speciesSlug: "bobwhite-quail", zone: "Statewide", type: "Regular", windows: [{ label: "Regular", start: "2026-11-01", end: "2027-02-28" }] },
  { id: "pheasant", game: "Pheasant", zone: "Panhandle / South Plains", type: "Regular", windows: [{ label: "Regular", start: "2026-12-05", end: "2027-01-03" }] },
  { id: "javelina-north", game: "Javelina", speciesSlug: "javelina", zone: "North", type: "General", windows: [{ label: "General", start: "2026-10-01", end: "2027-02-28" }] },
  { id: "javelina-south", game: "Javelina", speciesSlug: "javelina", zone: "South", type: "General", windows: [{ label: "Year-round", start: "2026-09-01", end: "2027-08-31" }] },
  { id: "squirrel-east", game: "Squirrel", zone: "East Texas", type: "General", windows: [{ label: "Youth", start: "2026-09-25", end: "2026-09-27" }, { label: "Fall/winter", start: "2026-10-01", end: "2027-02-28" }, { label: "May", start: "2027-05-01", end: "2027-05-31" }] },
  { id: "alligator-core", game: "Alligator", zone: "22 core counties & special properties", type: "General", windows: [{ label: "General", start: "2026-09-10", end: "2026-09-30" }] },
  { id: "alligator-other", game: "Alligator", zone: "All other counties", type: "General", windows: [{ label: "General", start: "2027-04-01", end: "2027-06-30" }] },
]

export function parseDay(iso: string) {
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(y, m - 1, d)
}

export function seasonStatus(s: HuntSeason, today = new Date()) {
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
  for (const w of s.windows) {
    const a = parseDay(w.start).getTime()
    const b = parseDay(w.end).getTime()
    if (t >= a && t <= b) return { state: "open" as const, window: w, daysLeft: Math.round((b - t) / 86400000) }
  }
  const next = s.windows.map((w) => ({ w, a: parseDay(w.start).getTime() })).filter((x) => x.a > t).sort((x, y) => x.a - y.a)[0]
  if (next) return { state: "upcoming" as const, window: next.w, daysUntil: Math.round((next.a - t) / 86400000) }
  return { state: "closed" as const }
}

export function fmtRange(w: { start: string; end: string }) {
  const f = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  const a = parseDay(w.start)
  const b = parseDay(w.end)
  return a.getTime() === b.getTime() ? f(a) : `${f(a)} – ${f(b)}${a.getFullYear() !== b.getFullYear() ? `, ${b.getFullYear()}` : ""}`
}
