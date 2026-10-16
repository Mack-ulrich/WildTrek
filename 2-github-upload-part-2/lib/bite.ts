/**
 * WildTrek Bite Score: a 0–100 blend of the factors anglers and hunters swear by.
 * It's a planning aid, not a promise.
 */
export interface BiteInputs {
  solunarScore: number // 0–100 from solunarDay
  wind: number // mph
  pressureTrend: "rising" | "falling" | "steady"
  inSolunarPeriod: boolean
  nearTwilight: boolean
  activity: "fishing" | "hunting"
}

export function biteScore(i: BiteInputs) {
  const factors: { label: string; value: number; note: string }[] = []

  factors.push({ label: "Moon", value: Math.round(i.solunarScore * 0.3), note: i.solunarScore > 70 ? "Strong phase" : i.solunarScore > 50 ? "Average phase" : "Weak phase" })

  let windPts: number
  let windNote: string
  if (i.activity === "fishing") {
    if (i.wind <= 4) { windPts = 14; windNote = "Glassy, fish may be spooky" }
    else if (i.wind <= 14) { windPts = 25; windNote = "Ideal chop" }
    else if (i.wind <= 20) { windPts = 12; windNote = "Breezy, fish protected water" }
    else { windPts = 2; windNote = "Too windy for most boats" }
  } else {
    if (i.wind <= 12) { windPts = 25; windNote = "Calm, game moving" }
    else if (i.wind <= 20) { windPts = 15; windNote = "Breezy, hunt sheltered cover" }
    else { windPts = 5; windNote = "High wind, game bedded" }
  }
  factors.push({ label: "Wind", value: windPts, note: windNote })

  const pPts = i.pressureTrend === "falling" ? 25 : i.pressureTrend === "steady" ? 17 : 10
  factors.push({ label: "Pressure", value: pPts, note: i.pressureTrend === "falling" ? "Falling, pre-front feed" : i.pressureTrend === "steady" ? "Stable" : "Rising, post-front lull" })

  const tPts = (i.inSolunarPeriod ? 12 : 0) + (i.nearTwilight ? 8 : 0)
  factors.push({ label: "Timing", value: tPts, note: i.inSolunarPeriod ? "In a solunar window" : i.nearTwilight ? "Near dawn/dusk" : "Midday lull" })

  const score = Math.max(5, Math.min(100, factors.reduce((s, f) => s + f.value, 0)))
  const label = score >= 80 ? "Excellent" : score >= 62 ? "Good" : score >= 42 ? "Fair" : "Slow"
  return { score, label, factors }
}

export function windDir(deg: number) {
  return ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"][Math.round(deg / 22.5) % 16]
}
