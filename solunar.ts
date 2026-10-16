/**
 * Lightweight sun + moon math for solunar tables. No API needed.
 * Moon transit times are approximations (±20 min) — good enough for planning a day afield.
 */

const RAD = Math.PI / 180
const SYNODIC = 29.530588853
const KNOWN_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14) // Jan 6 2000 18:14 UTC

export function moonAge(date: Date) {
  const days = (date.getTime() - KNOWN_NEW_MOON) / 86400000
  return ((days % SYNODIC) + SYNODIC) % SYNODIC
}

export function moonIllumination(date: Date) {
  return (1 - Math.cos((2 * Math.PI * moonAge(date)) / SYNODIC)) / 2
}

export function moonPhaseName(date: Date) {
  const a = moonAge(date)
  if (a < 1.84566) return "New Moon"
  if (a < 5.53699) return "Waxing Crescent"
  if (a < 9.22831) return "First Quarter"
  if (a < 12.91963) return "Waxing Gibbous"
  if (a < 16.61096) return "Full Moon"
  if (a < 20.30228) return "Waning Gibbous"
  if (a < 23.99361) return "Last Quarter"
  if (a < 27.68493) return "Waning Crescent"
  return "New Moon"
}

/** Day-of-year based NOAA approximation. Returns UTC Dates. */
export function sunTimes(date: Date, lat: number, lon: number) {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0)
  const doy = Math.floor((Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - start) / 86400000)
  const g = ((2 * Math.PI) / 365) * (doy - 1)
  const eqTime = 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g) - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g))
  const decl = 0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g) - 0.006758 * Math.cos(2 * g) + 0.000907 * Math.sin(2 * g) - 0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g)
  const cosH = (Math.cos(90.833 * RAD) - Math.sin(lat * RAD) * Math.sin(decl)) / (Math.cos(lat * RAD) * Math.cos(decl))
  const ha = Math.acos(Math.min(1, Math.max(-1, cosH))) / RAD
  const dayStart = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  const noonMin = 720 - 4 * lon - eqTime
  return {
    sunrise: new Date(dayStart + (noonMin - 4 * ha) * 60000),
    solarNoon: new Date(dayStart + noonMin * 60000),
    sunset: new Date(dayStart + (noonMin + 4 * ha) * 60000),
  }
}

export interface SolunarPeriod {
  kind: "major" | "minor"
  label: string
  start: Date
  end: Date
  peak: Date
}

/**
 * Major periods: moon overhead (upper transit) and underfoot (lower transit), ~2 hours.
 * Minor periods: approximate moonrise and moonset, ~1 hour.
 */
export function solunarDay(date: Date, lat: number, lon: number) {
  const { solarNoon, sunrise, sunset } = sunTimes(date, lat, lon)
  const age = moonAge(solarNoon)
  // The moon transits ~24h50m per day; at new moon it transits with the sun.
  const lunarDay = 24.8412 * 3600000
  let upper = solarNoon.getTime() + (age / SYNODIC) * lunarDay
  const dayStart = solarNoon.getTime() - 12 * 3600000
  const dayEnd = solarNoon.getTime() + 12 * 3600000
  while (upper > dayEnd) upper -= lunarDay
  while (upper < dayStart) upper += lunarDay

  const half = lunarDay / 2
  const quarter = lunarDay / 4
  const candidates: { kind: "major" | "minor"; label: string; t: number }[] = []
  for (const shift of [-lunarDay, 0, lunarDay]) {
    const u = upper + shift
    candidates.push({ kind: "major", label: "Moon overhead", t: u })
    candidates.push({ kind: "major", label: "Moon underfoot", t: u + half })
    candidates.push({ kind: "minor", label: "Moonrise", t: u - quarter })
    candidates.push({ kind: "minor", label: "Moonset", t: u + quarter })
  }

  const periods: SolunarPeriod[] = candidates
    .filter((c) => c.t >= dayStart && c.t < dayEnd)
    .sort((a, b) => a.t - b.t)
    .map((c) => {
      const span = c.kind === "major" ? 60 : 30
      return { kind: c.kind, label: c.label, peak: new Date(c.t), start: new Date(c.t - span * 60000), end: new Date(c.t + span * 60000) }
    })

  // Rating: new and full moons are strongest, quarters weakest. Bonus when a period overlaps dawn or dusk.
  const phaseStrength = Math.abs(Math.cos((2 * Math.PI * age) / SYNODIC)) // 1 at new/full, 0 at quarters
  const overlapsTwilight = periods.some((p) =>
    [sunrise.getTime(), sunset.getTime()].some((t) => Math.abs(p.peak.getTime() - t) < 75 * 60000),
  )
  const score = Math.round(Math.min(100, 35 + phaseStrength * 50 + (overlapsTwilight ? 15 : 0)))

  return { periods, sunrise, sunset, solarNoon, moonAge: age, illumination: moonIllumination(solarNoon), phase: moonPhaseName(solarNoon), score }
}

export function fmtTime(d: Date, tz = "America/Chicago") {
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: tz })
}

export function moonEmojiless(age: number) {
  // Returns 0..7 index for drawing a phase icon
  return Math.round((age / SYNODIC) * 8) % 8
}
