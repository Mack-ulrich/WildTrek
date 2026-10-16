import { NextRequest, NextResponse } from "next/server"
import { LOCATION_BY_SLUG } from "@/data/locations"

/**
 * Live conditions for a location — no API keys required.
 *  - Weather: Open-Meteo forecast API
 *  - Waves / water temp: Open-Meteo marine API (coastal spots)
 *  - Tides: NOAA CO-OPS predictions (stations with tideStation)
 */

const WEATHER_CODES: Record<number, string> = {
  0: "Clear", 1: "Mostly clear", 2: "Partly cloudy", 3: "Overcast", 45: "Fog", 48: "Freezing fog",
  51: "Light drizzle", 53: "Drizzle", 55: "Heavy drizzle", 61: "Light rain", 63: "Rain", 65: "Heavy rain",
  71: "Light snow", 73: "Snow", 75: "Heavy snow", 80: "Rain showers", 81: "Rain showers", 82: "Violent showers",
  95: "Thunderstorms", 96: "Thunderstorms w/ hail", 99: "Severe thunderstorms",
}

function ymd(d: Date) {
  const s = d.toLocaleDateString("en-CA", { timeZone: "America/Chicago" }) // YYYY-MM-DD
  return s.replaceAll("-", "")
}

async function getJson(url: string) {
  const res = await fetch(url, { next: { revalidate: 900 } })
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  return res.json()
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const loc = LOCATION_BY_SLUG[sp.get("loc") || "port-aransas"] ?? LOCATION_BY_SLUG["port-aransas"]
  const { lat, lon } = loc
  const coastal = Boolean(loc.tideStation)

  const weatherUrl =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m,pressure_msl,cloud_cover,weather_code,precipitation` +
    `&hourly=temperature_2m,pressure_msl,wind_speed_10m,wind_gusts_10m,precipitation_probability` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,wind_speed_10m_max,wind_gusts_10m_max,precipitation_probability_max` +
    `&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=America%2FChicago&forecast_days=7&past_days=1`

  const marineUrl =
    `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}` +
    `&current=wave_height,sea_surface_temperature&length_unit=imperial&timezone=America%2FChicago`

  const begin = ymd(new Date())
  const tideBase = loc.tideStation
    ? `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=predictions&application=wildtrek&begin_date=${begin}&datum=MLLW&station=${loc.tideStation.id}&time_zone=lst_ldt&units=english&format=json`
    : null

  const [weather, marine, tideHilo, tideCurve] = await Promise.allSettled([
    getJson(weatherUrl),
    coastal ? getJson(marineUrl) : Promise.reject(new Error("inland")),
    tideBase ? getJson(`${tideBase}&range=72&interval=hilo`) : Promise.reject(new Error("no station")),
    tideBase ? getJson(`${tideBase}&range=48&interval=h`) : Promise.reject(new Error("no station")),
  ])

  if (weather.status !== "fulfilled") {
    return NextResponse.json({ error: "Weather service unavailable. Try again in a minute." }, { status: 503 })
  }

  const w = weather.value
  const c = w.current
  const hourly = w.hourly as { time: string[]; pressure_msl: number[]; wind_speed_10m: number[]; temperature_2m: number[]; precipitation_probability: number[]; wind_gusts_10m: number[] }

  // Pressure trend over the last 3 hours (hPa)
  const nowIdx = Math.max(0, hourly.time.findIndex((t) => t >= c.time.slice(0, 13) + ":00"))
  const p3 = hourly.pressure_msl[Math.max(0, nowIdx - 3)]
  const trend = c.pressure_msl - p3
  const pressureTrend = trend > 1 ? "rising" : trend < -1 ? "falling" : "steady"

  const sst = marine.status === "fulfilled" ? marine.value.current?.sea_surface_temperature : undefined
  const waves = marine.status === "fulfilled" ? marine.value.current?.wave_height : undefined

  const next24 = hourly.time.slice(nowIdx, nowIdx + 24).map((t, i) => ({
    time: t,
    temp: Math.round(hourly.temperature_2m[nowIdx + i]),
    wind: Math.round(hourly.wind_speed_10m[nowIdx + i]),
    gust: Math.round(hourly.wind_gusts_10m[nowIdx + i]),
    rain: hourly.precipitation_probability[nowIdx + i] ?? 0,
    pressure: Math.round(hourly.pressure_msl[nowIdx + i] * 10) / 10,
  }))

  const daily = (w.daily.time as string[]).slice(1).map((d: string, i: number) => ({
    date: d,
    code: w.daily.weather_code[i + 1],
    summary: WEATHER_CODES[w.daily.weather_code[i + 1]] ?? "—",
    high: Math.round(w.daily.temperature_2m_max[i + 1]),
    low: Math.round(w.daily.temperature_2m_min[i + 1]),
    wind: Math.round(w.daily.wind_speed_10m_max[i + 1]),
    gust: Math.round(w.daily.wind_gusts_10m_max[i + 1]),
    rain: w.daily.precipitation_probability_max[i + 1] ?? 0,
  }))

  const tides =
    tideHilo.status === "fulfilled" && Array.isArray(tideHilo.value.predictions)
      ? tideHilo.value.predictions.map((p: { t: string; v: string; type: string }) => ({ time: p.t, height: Number(p.v), type: p.type === "H" ? "high" : "low" }))
      : []
  const tideSeries =
    tideCurve.status === "fulfilled" && Array.isArray(tideCurve.value.predictions)
      ? tideCurve.value.predictions.map((p: { t: string; v: string }) => ({ time: p.t, height: Number(p.v) }))
      : []

  return NextResponse.json({
    location: { slug: loc.slug, name: loc.name, lat, lon, station: loc.tideStation ?? null },
    updated: c.time,
    current: {
      temp: Math.round(c.temperature_2m),
      feelsLike: Math.round(c.apparent_temperature),
      humidity: c.relative_humidity_2m,
      wind: Math.round(c.wind_speed_10m),
      gust: Math.round(c.wind_gusts_10m),
      windDir: c.wind_direction_10m,
      pressure: Math.round(c.pressure_msl * 10) / 10,
      pressureInHg: Math.round(c.pressure_msl * 0.02953 * 100) / 100,
      pressureTrend,
      clouds: c.cloud_cover,
      code: c.weather_code,
      summary: WEATHER_CODES[c.weather_code] ?? "—",
      waterTemp: typeof sst === "number" ? Math.round(sst * 9 / 5 + 32) : null,
      waves: typeof waves === "number" ? Math.round(waves * 10) / 10 : null,
    },
    next24,
    daily,
    tides,
    tideSeries,
  })
}
