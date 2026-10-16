"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Wind, Thermometer, Gauge, Droplets, Waves, Sunrise, Sunset, Moon, ArrowUp, ArrowDown, Minus, RefreshCw, MapPin, Fish, Crosshair } from "lucide-react"
import { LOCATIONS } from "@/data/locations"
import { solunarDay, fmtTime } from "@/lib/solunar"
import { biteScore, windDir } from "@/lib/bite"
import { cn } from "@/utils"

interface ConditionsData {
  location: { slug: string; name: string; station: { id: string; name: string } | null }
  updated: string
  current: {
    temp: number; feelsLike: number; humidity: number; wind: number; gust: number; windDir: number
    pressure: number; pressureInHg: number; pressureTrend: "rising" | "falling" | "steady"; clouds: number; summary: string
    waterTemp: number | null; waves: number | null
  }
  next24: { time: string; temp: number; wind: number; gust: number; rain: number }[]
  daily: { date: string; summary: string; high: number; low: number; wind: number; gust: number; rain: number }[]
  tides: { time: string; height: number; type: "high" | "low" }[]
  tideSeries: { time: string; height: number }[]
}

const TZ = "America/Chicago"
const centralYmd = (d = new Date()) => d.toLocaleDateString("en-CA", { timeZone: TZ })
const dayAnchor = (ymd: string) => {
  const [y, m, d] = ymd.split("-").map(Number)
  return new Date(Date.UTC(y, m - 1, d, 18))
}
const localWall = (s: string) => new Date(s.replace(" ", "T"))
const nowWall = () => new Date(new Date().toLocaleString("en-US", { timeZone: TZ }))
const hm = (s: string) => localWall(s).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })

export function ConditionsBoard({ defaultLoc = "port-aransas", compact = false }: { defaultLoc?: string; compact?: boolean }) {
  const [loc, setLoc] = useState(defaultLoc)
  const [activity, setActivity] = useState<"fishing" | "hunting">("fishing")
  const [data, setData] = useState<ConditionsData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetch(`/api/conditions?loc=${loc}`)
      .then(async (r) => {
        const j = await r.json()
        if (!r.ok) throw new Error(j.error || "Conditions unavailable")
        return j
      })
      .then((j) => !cancelled && setData(j))
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [loc, tick])

  const location = LOCATIONS.find((l) => l.slug === loc)!
  useEffect(() => { if (location.activity === "hunting") setActivity("hunting") }, [location.activity])

  const today = centralYmd()
  const sol = useMemo(() => solunarDay(dayAnchor(today), location.lat, location.lon), [today, location.lat, location.lon])
  const week = useMemo(
    () => Array.from({ length: 7 }).map((_, i) => {
      const d = dayAnchor(today)
      d.setUTCDate(d.getUTCDate() + i)
      return { date: d, ...solunarDay(d, location.lat, location.lon) }
    }),
    [today, location.lat, location.lon],
  )

  const now = Date.now()
  const inPeriod = sol.periods.some((p) => now >= p.start.getTime() && now <= p.end.getTime())
  const nearTwilight = [sol.sunrise, sol.sunset].some((t) => Math.abs(now - t.getTime()) < 90 * 60000)
  const nextPeriod = sol.periods.find((p) => p.end.getTime() > now)

  const bite = data
    ? biteScore({ solunarScore: sol.score, wind: data.current.wind, pressureTrend: data.current.pressureTrend, inSolunarPeriod: inPeriod, nearTwilight, activity })
    : null

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center">
        <label className="flex flex-1 items-center gap-2 rounded-xl bg-stone-50 px-3 py-2">
          <MapPin className="h-4 w-4 shrink-0 text-emerald-800" />
          <select value={loc} onChange={(e) => setLoc(e.target.value)} className="w-full bg-transparent text-sm font-medium text-stone-900 outline-none">
            <optgroup label="Coast (with tides)">
              {LOCATIONS.filter((l) => l.tideStation).map((l) => <option key={l.slug} value={l.slug}>{l.name}</option>)}
            </optgroup>
            <optgroup label="Inland">
              {LOCATIONS.filter((l) => !l.tideStation).map((l) => <option key={l.slug} value={l.slug}>{l.name}</option>)}
            </optgroup>
          </select>
        </label>
        <div className="flex rounded-xl bg-stone-100 p-1">
          {(["fishing", "hunting"] as const).map((a) => (
            <button
              key={a}
              onClick={() => setActivity(a)}
              className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition", activity === a ? "bg-white text-stone-900 shadow-sm" : "text-stone-600 hover:text-stone-900")}
            >
              {a === "fishing" ? <Fish className="h-4 w-4" /> : <Crosshair className="h-4 w-4" />}{a}
            </button>
          ))}
        </div>
        <button onClick={() => setTick((t) => t + 1)} className="flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm text-stone-600 hover:bg-stone-100" aria-label="Refresh">
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} /> {compact ? "" : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error} <button className="ml-2 font-semibold underline" onClick={() => setTick((t) => t + 1)}>Try again</button>
        </div>
      )}

      <div className={cn("grid gap-6", compact ? "lg:grid-cols-[320px_1fr]" : "lg:grid-cols-[360px_1fr]")}>
        {/* Bite score */}
        <div className="rounded-2xl bg-emerald-950 p-6 text-white shadow-lg">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">WildTrek {activity === "fishing" ? "Bite" : "Movement"} Score</p>
          <div className="mt-4 flex items-center gap-5">
            <ScoreRing value={bite?.score ?? 0} loading={!bite} />
            <div>
              <p className="font-display text-4xl font-bold">{bite?.label ?? "—"}</p>
              <p className="text-sm text-emerald-200">{location.name}</p>
              {nextPeriod && (
                <p className="mt-2 text-xs text-emerald-100">
                  {now >= nextPeriod.start.getTime() ? "Now: " : "Next: "}
                  <span className="font-semibold">{nextPeriod.kind === "major" ? "Major" : "Minor"}</span> {fmtTime(nextPeriod.start)}–{fmtTime(nextPeriod.end)}
                </p>
              )}
            </div>
          </div>
          <div className="mt-6 space-y-2.5">
            {bite?.factors.map((f) => (
              <div key={f.label}>
                <div className="flex justify-between text-xs"><span className="font-semibold">{f.label}</span><span className="text-emerald-200">{f.note}</span></div>
                <div className="mt-1 h-1.5 rounded-full bg-emerald-900"><div className="h-full rounded-full bg-amber-400" style={{ width: `${(f.value / (f.label === "Moon" ? 30 : f.label === "Timing" ? 20 : 25)) * 100}%` }} /></div>
              </div>
            ))}
          </div>
          <p className="mt-5 text-[11px] leading-relaxed text-emerald-300/80">Blends moon phase, wind, barometric trend and solunar timing. It's a planning aid, not a promise.</p>
        </div>

        {/* Current weather */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat icon={Thermometer} label="Air" value={data ? `${data.current.temp}°` : "—"} sub={data ? `Feels ${data.current.feelsLike}° · ${data.current.summary}` : ""} />
            <Stat icon={Wind} label="Wind" value={data ? `${data.current.wind} mph` : "—"} sub={data ? `${windDir(data.current.windDir)} · gusts ${data.current.gust}` : ""} />
            <Stat
              icon={Gauge}
              label="Pressure"
              value={data ? `${data.current.pressureInHg}"` : "—"}
              sub={data ? (
                <span className="inline-flex items-center gap-1">
                  {data.current.pressureTrend === "rising" ? <ArrowUp className="h-3 w-3" /> : data.current.pressureTrend === "falling" ? <ArrowDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                  <span className="capitalize">{data.current.pressureTrend}</span>
                </span>
              ) : ""}
            />
            {data?.current.waterTemp != null ? (
              <Stat icon={Waves} label="Water" value={`${data.current.waterTemp}°`} sub={data.current.waves != null ? `Waves ${data.current.waves} ft` : "Gulf surface"} />
            ) : (
              <Stat icon={Droplets} label="Humidity" value={data ? `${data.current.humidity}%` : "—"} sub={data ? `${data.current.clouds}% cloud` : ""} />
            )}
          </div>

          {/* Tide chart */}
          {location.tideStation ? (
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-xl font-bold text-stone-900">Tides</h3>
                <span className="text-xs text-stone-500">NOAA station {location.tideStation.name} ({location.tideStation.id}) · ft MLLW</span>
              </div>
              {data && data.tideSeries.length > 0 ? <TideChart series={data.tideSeries} tides={data.tides} /> : <div className="h-40 animate-pulse rounded-lg bg-stone-100" />}
              {data && (
                <div className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {data.tides.filter((t) => localWall(t.time).getTime() > nowWall().getTime() - 30 * 60000).slice(0, 8).map((t) => (
                    <div key={t.time} className={cn("shrink-0 rounded-lg px-3 py-2 text-center", t.type === "high" ? "bg-sky-50 text-sky-900" : "bg-stone-100 text-stone-700")}>
                      <p className="text-[10px] font-semibold uppercase">{t.type} · {localWall(t.time).toLocaleDateString("en-US", { weekday: "short" })}</p>
                      <p className="font-display text-lg font-bold">{hm(t.time)}</p>
                      <p className="text-xs">{t.height.toFixed(1)} ft</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <h3 className="text-xl font-bold text-stone-900">Next 24 hours</h3>
              <p className="mb-3 text-xs text-stone-500">Wind (bars) and rain chance — inland spot, no tides.</p>
              {data ? <HourlyBars hours={data.next24} /> : <div className="h-32 animate-pulse rounded-lg bg-stone-100" />}
            </div>
          )}
        </div>
      </div>

      {!compact && (
        <>
          {location.tideStation && data && (
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <h3 className="text-xl font-bold text-stone-900">Next 24 hours</h3>
              <p className="mb-3 text-xs text-stone-500">Wind speed (bars) and rain chance by hour.</p>
              <HourlyBars hours={data.next24} />
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Solunar */}
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-stone-900">Solunar table</h3>
                <span className="flex items-center gap-1.5 text-xs text-stone-500"><Moon className="h-3.5 w-3.5" />{sol.phase} · {Math.round(sol.illumination * 100)}%</span>
              </div>
              <div className="mb-4 flex gap-4 text-sm text-stone-700">
                <span className="flex items-center gap-1.5"><Sunrise className="h-4 w-4 text-amber-500" />{fmtTime(sol.sunrise)}</span>
                <span className="flex items-center gap-1.5"><Sunset className="h-4 w-4 text-orange-600" />{fmtTime(sol.sunset)}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[420px] text-sm">
                  <thead>
                    <tr className="border-b text-left text-[11px] uppercase tracking-wider text-stone-500">
                      <th className="py-2 font-semibold">Day</th><th className="font-semibold">Moon</th><th className="font-semibold">Major</th><th className="font-semibold">Minor</th><th className="text-right font-semibold">Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {week.map((d, i) => (
                      <tr key={i} className="border-b border-stone-100 last:border-0">
                        <td className="py-2.5 font-medium">{i === 0 ? "Today" : d.date.toLocaleDateString("en-US", { weekday: "short", month: "numeric", day: "numeric", timeZone: TZ })}</td>
                        <td><MoonIcon age={d.moonAge} /></td>
                        <td className="text-xs">{d.periods.filter((p) => p.kind === "major").map((p) => fmtTime(p.peak)).join(" · ")}</td>
                        <td className="text-xs text-stone-500">{d.periods.filter((p) => p.kind === "minor").map((p) => fmtTime(p.peak)).join(" · ")}</td>
                        <td className="text-right"><RatingDots score={d.score} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-[11px] text-stone-500">Peak times shown. Major periods last ~2 hrs, minor ~1 hr. Times approximate (±20 min).</p>
            </div>

            {/* 7 day */}
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-xl font-bold text-stone-900">7-day outlook</h3>
              <div className="space-y-1">
                {data?.daily.map((d) => (
                  <div key={d.date} className="grid grid-cols-[64px_1fr_auto_auto] items-center gap-3 rounded-lg px-2 py-2 text-sm hover:bg-stone-50">
                    <span className="font-medium">{new Date(d.date + "T12:00").toLocaleDateString("en-US", { weekday: "short", day: "numeric" })}</span>
                    <span className="truncate text-stone-600">{d.summary}{d.rain > 20 && <span className="ml-1 text-sky-700">· {d.rain}%</span>}</span>
                    <span className={cn("rounded-md px-2 py-0.5 text-xs font-semibold", d.wind > 20 ? "bg-red-100 text-red-800" : d.wind > 14 ? "bg-amber-100 text-amber-900" : "bg-emerald-100 text-emerald-900")}>{d.wind} mph</span>
                    <span className="w-16 text-right font-display text-lg font-semibold">{d.high}°<span className="text-stone-400">/{d.low}°</span></span>
                  </div>
                )) ?? <div className="h-64 animate-pulse rounded-lg bg-stone-100" />}
              </div>
              <p className="mt-3 text-[11px] text-stone-500">Wind badge: green under 15 mph, amber 15–20, red over 20 (small-craft caution).</p>
            </div>
          </div>
        </>
      )}

      {compact && (
        <div className="text-right">
          <Link href={`/conditions?loc=${loc}`} className="text-sm font-semibold text-emerald-800 hover:underline">Full tides, solunar & 7-day forecast →</Link>
        </div>
      )}
    </div>
  )
}

function Stat({ icon: Icon, label, value, sub }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; sub?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-stone-500"><Icon className="h-3.5 w-3.5" />{label}</p>
      <p className="mt-1 font-display text-3xl font-bold text-stone-900">{value}</p>
      <p className="truncate text-xs text-stone-500">{sub}</p>
    </div>
  )
}

function ScoreRing({ value, loading }: { value: number; loading?: boolean }) {
  const r = 42
  const c = 2 * Math.PI * r
  return (
    <svg viewBox="0 0 100 100" className="h-28 w-28 shrink-0 -rotate-90">
      <circle cx="50" cy="50" r={r} stroke="#064e3b" strokeWidth="10" fill="none" />
      <circle cx="50" cy="50" r={r} stroke="#fbbf24" strokeWidth="10" fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} className="transition-all duration-700" />
      <text x="50" y="50" textAnchor="middle" dominantBaseline="central" className="rotate-90 fill-white font-display text-[28px] font-bold" style={{ transformOrigin: "50px 50px" }}>
        {loading ? "…" : value}
      </text>
    </svg>
  )
}

function TideChart({ series, tides }: { series: { time: string; height: number }[]; tides: { time: string; height: number; type: string }[] }) {
  const W = 720, H = 170, P = 24
  const t0 = localWall(series[0].time).getTime()
  const t1 = localWall(series[series.length - 1].time).getTime()
  const hs = series.map((s) => s.height)
  const min = Math.min(...hs) - 0.2
  const max = Math.max(...hs) + 0.2
  const x = (t: number) => P + ((t - t0) / (t1 - t0)) * (W - 2 * P)
  const y = (h: number) => H - P - ((h - min) / (max - min)) * (H - 2 * P)
  const pts = series.map((s) => `${x(localWall(s.time).getTime()).toFixed(1)},${y(s.height).toFixed(1)}`)
  const line = `M${pts.join(" L")}`
  const area = `${line} L${x(t1)},${H - P} L${x(t0)},${H - P} Z`
  const now = nowWall().getTime()
  const days: number[] = []
  const d = new Date(t0); d.setHours(24, 0, 0, 0)
  while (d.getTime() < t1) { days.push(d.getTime()); d.setDate(d.getDate() + 1) }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-44 w-full" role="img" aria-label="Tide height chart for the next 48 hours">
      <defs>
        <linearGradient id="tidefill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0284c7" stopOpacity="0.35" /><stop offset="100%" stopColor="#0284c7" stopOpacity="0.03" /></linearGradient>
      </defs>
      {days.map((t) => (
        <g key={t}>
          <line x1={x(t)} x2={x(t)} y1={P - 8} y2={H - P} stroke="#e7e5e4" strokeDasharray="3 4" />
          <text x={x(t) + 4} y={P - 10} className="fill-stone-400 text-[11px]">{new Date(t).toLocaleDateString("en-US", { weekday: "short" })}</text>
        </g>
      ))}
      <path d={area} fill="url(#tidefill)" />
      <path d={line} fill="none" stroke="#0369a1" strokeWidth="2.5" strokeLinejoin="round" />
      {tides.filter((t) => { const tt = localWall(t.time).getTime(); return tt >= t0 && tt <= t1 }).map((t) => {
        const tt = localWall(t.time).getTime()
        return (
          <g key={t.time}>
            <circle cx={x(tt)} cy={y(t.height)} r="4" fill={t.type === "high" ? "#0369a1" : "#78716c"} stroke="#fff" strokeWidth="2" />
            <text x={x(tt)} y={t.type === "high" ? y(t.height) - 9 : y(t.height) + 17} textAnchor="middle" className="fill-stone-600 text-[10px] font-semibold">{hm(t.time)}</text>
          </g>
        )
      })}
      {now >= t0 && now <= t1 && (
        <g>
          <line x1={x(now)} x2={x(now)} y1={P - 4} y2={H - P} stroke="#ea580c" strokeWidth="2" />
          <text x={x(now)} y={H - 6} textAnchor="middle" className="fill-orange-600 text-[10px] font-bold">NOW</text>
        </g>
      )}
    </svg>
  )
}

function HourlyBars({ hours }: { hours: { time: string; wind: number; gust: number; rain: number; temp: number }[] }) {
  const maxW = Math.max(25, ...hours.map((h) => h.gust))
  return (
    <div className="flex h-36 items-end gap-1">
      {hours.map((h, i) => (
        <div key={h.time} className="group relative flex flex-1 flex-col items-center justify-end gap-1" title={`${new Date(h.time).toLocaleTimeString("en-US", { hour: "numeric" })}: ${h.wind} mph (gust ${h.gust}), rain ${h.rain}%, ${h.temp}°`}>
          <div className="relative flex w-full flex-1 items-end">
            <div className="absolute bottom-0 w-full rounded-t bg-stone-200" style={{ height: `${(h.gust / maxW) * 100}%` }} />
            <div className={cn("relative w-full rounded-t", h.wind > 20 ? "bg-red-500" : h.wind > 14 ? "bg-amber-500" : "bg-emerald-600")} style={{ height: `${(h.wind / maxW) * 100}%` }} />
          </div>
          <div className="h-1.5 w-full rounded-full bg-sky-100"><div className="h-full rounded-full bg-sky-500" style={{ width: `${h.rain}%` }} /></div>
          <span className={cn("text-[9px] text-stone-500", i % 3 !== 0 && "invisible")}>{new Date(h.time).toLocaleTimeString("en-US", { hour: "numeric" }).replace(" ", "")}</span>
        </div>
      ))}
    </div>
  )
}

function MoonIcon({ age }: { age: number }) {
  const f = age / 29.53
  const lit = (1 - Math.cos(2 * Math.PI * f)) / 2
  const waxing = f < 0.5
  const rx = Math.abs(1 - 2 * lit) * 9
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5" aria-label={`${Math.round(lit * 100)}% illuminated`}>
      <circle cx="10" cy="10" r="9" fill="#292524" />
      <path
        d={`M10 1 A9 9 0 0 ${waxing ? 1 : 0} 10 19 A${rx} 9 0 0 ${lit > 0.5 ? (waxing ? 1 : 0) : (waxing ? 0 : 1)} 10 1`}
        fill="#fde68a"
      />
    </svg>
  )
}

function RatingDots({ score }: { score: number }) {
  const n = score >= 80 ? 4 : score >= 62 ? 3 : score >= 45 ? 2 : 1
  return (
    <span className="inline-flex gap-0.5">
      {[0, 1, 2, 3].map((i) => <span key={i} className={cn("h-2 w-2 rounded-full", i < n ? "bg-orange-500" : "bg-stone-200")} />)}
    </span>
  )
}
