import { cn } from "@/utils"

export type SceneKind = "coast" | "offshore" | "lake" | "river" | "brush" | "hills" | "marsh" | "desert" | "pines"

const PALETTES: Record<SceneKind, { sky: [string, string]; far: string; mid: string; near: string; water?: string; sun: string }> = {
  coast: { sky: ["#f6c58b", "#7fb3c9"], far: "#8fb6a4", mid: "#4d8b78", near: "#2d5f52", water: "#2f7896", sun: "#fde3b4" },
  offshore: { sky: ["#9fd0ea", "#2e6f9e"], far: "#3b7fa8", mid: "#235e85", near: "#123f5e", water: "#1c5a82", sun: "#fff4d6" },
  lake: { sky: ["#f2b88a", "#8aa7c0"], far: "#7a9a7e", mid: "#4c6f52", near: "#2a4a33", water: "#4b7f93", sun: "#ffe0b8" },
  river: { sky: ["#cde2c5", "#86b2a5"], far: "#9ab48a", mid: "#62875a", near: "#3a5a38", water: "#5c95a0", sun: "#f6f1d8" },
  brush: { sky: ["#f4c27a", "#d98a4e"], far: "#b9935e", mid: "#8a6a3f", near: "#5a4526", sun: "#fff0c6" },
  hills: { sky: ["#f5d39b", "#b5c7c9"], far: "#9fb08f", mid: "#6f8a5d", near: "#43603a", sun: "#fff3d2" },
  marsh: { sky: ["#f0a87c", "#6c6f9a"], far: "#a39a72", mid: "#6e7a4f", near: "#3e4a2c", water: "#5a6f8f", sun: "#ffd7b0" },
  desert: { sky: ["#f7b37a", "#b06a6a"], far: "#c58c62", mid: "#9a5f45", near: "#5f3a2c", sun: "#ffe2b6" },
  pines: { sky: ["#d9e6d3", "#8fae9b"], far: "#5f8a6c", mid: "#355e45", near: "#1f3d2c", water: "#4f7d83", sun: "#f5f2dc" },
}

/** Hand-drawn style SVG landscapes so the app looks great without any photo assets. */
export function Scene({ kind, className, seed = 0 }: { kind: SceneKind; className?: string; seed?: number }) {
  const p = PALETTES[kind]
  const id = `sc-${kind}-${seed}`
  const s = (n: number) => n + ((seed * 37) % 23) - 11
  const hasWater = Boolean(p.water)

  return (
    <svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" className={cn("h-full w-full", className)} aria-hidden>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={p.sky[1]} />
          <stop offset="100%" stopColor={p.sky[0]} />
        </linearGradient>
        {hasWater && (
          <linearGradient id={`${id}-water`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.water} stopOpacity="0.85" />
            <stop offset="100%" stopColor={p.near} />
          </linearGradient>
        )}
      </defs>
      <rect width="400" height="240" fill={`url(#${id}-sky)`} />
      <circle cx={s(300)} cy={hasWater ? 128 : 110} r="26" fill={p.sun} opacity="0.9" />
      {kind === "offshore" ? (
        <>
          <rect y="140" width="400" height="100" fill={`url(#${id}-water)`} />
          <path d="M0 150 Q 50 144 100 150 T 200 150 T 300 150 T 400 150" stroke="#ffffff" strokeOpacity="0.25" fill="none" />
          <path d="M0 175 Q 50 168 100 175 T 200 175 T 300 175 T 400 175" stroke="#ffffff" strokeOpacity="0.18" fill="none" />
          <g transform={`translate(${s(150)} 128)`} fill={p.near}>
            <rect x="0" y="0" width="5" height="16" />
            <rect x="-14" y="-8" width="33" height="6" />
            <rect x="-4" y="-22" width="3" height="14" />
          </g>
        </>
      ) : (
        <>
          <path d={`M0 ${s(130)} C 70 ${s(105)} 130 ${s(120)} 200 ${s(112)} S 330 ${s(98)} 400 ${s(118)} V240 H0Z`} fill={p.far} />
          <path d={`M0 ${s(150)} C 80 ${s(135)} 160 ${s(155)} 240 ${s(140)} S 350 ${s(132)} 400 ${s(146)} V240 H0Z`} fill={p.mid} />
          {hasWater && <rect y="160" width="400" height="80" fill={`url(#${id}-water)`} />}
          {hasWater && <path d="M30 185 H120 M200 200 H320 M90 215 H190" stroke="#fff" strokeOpacity="0.22" strokeWidth="2" strokeLinecap="round" />}
          {!hasWater && <path d={`M0 ${s(185)} C 90 ${s(170)} 200 ${s(190)} 280 ${s(176)} S 380 ${s(170)} 400 ${s(180)} V240 H0Z`} fill={p.near} />}
          {(kind === "pines" || kind === "lake") &&
            Array.from({ length: 9 }).map((_, i) => {
              const x = 10 + i * 46 + ((seed * (i + 3)) % 18)
              const h = 30 + ((i * 13 + seed * 7) % 22)
              return <path key={i} d={`M${x} ${160} l10 -${h} l10 ${h}z`} fill={p.near} opacity="0.95" />
            })}
          {kind === "marsh" &&
            Array.from({ length: 24 }).map((_, i) => (
              <path key={i} d={`M${i * 17 + 4} 165 q2 -18 ${i % 2 ? 4 : -3} -26`} stroke={p.near} strokeWidth="2" fill="none" />
            ))}
          {kind === "brush" &&
            Array.from({ length: 7 }).map((_, i) => (
              <ellipse key={i} cx={30 + i * 58 + (seed % 9)} cy={176 + (i % 2) * 6} rx="22" ry="11" fill="#3f311b" opacity="0.8" />
            ))}
          {kind === "desert" && <path d={`M${s(80)} 180 v-34 m0 12 h-10 v-12 m10 18 h10 v-16`} stroke={p.near} strokeWidth="5" strokeLinecap="round" fill="none" />}
          {kind === "coast" && <path d={`M${s(250)} 168 l18 -9 l2 9 z`} fill="#f7efe0" opacity="0.9" />}
        </>
      )}
      {/* Birds */}
      <path d={`M${s(90)} 60 q5 -5 10 0 q5 -5 10 0 M${s(120)} 48 q4 -4 8 0 q4 -4 8 0`} stroke="#1f2a24" strokeOpacity="0.45" strokeWidth="1.6" fill="none" />
    </svg>
  )
}

export function sceneForLocationType(t: string): SceneKind {
  return ({ bay: "coast", offshore: "offshore", surf: "coast", lake: "lake", river: "river", ranch: "hills", marsh: "marsh", "public-land": "desert" } as Record<string, SceneKind>)[t] ?? "coast"
}

export function sceneForRegion(r: string): SceneKind {
  return ({ "coastal-bend": "coast", "upper-coast": "marsh", "lower-coast": "coast", "hill-country": "hills", "south-texas": "brush", "east-texas": "pines", "west-texas": "desert", panhandle: "brush" } as Record<string, SceneKind>)[r] ?? "coast"
}

export function sceneForSpecies(kind: string): SceneKind {
  return ({ saltwater: "coast", freshwater: "lake", "big-game": "brush", upland: "hills", waterfowl: "marsh", "small-game": "pines" } as Record<string, SceneKind>)[kind] ?? "coast"
}
