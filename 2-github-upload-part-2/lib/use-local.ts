"use client"

import { useCallback, useEffect, useState } from "react"

/** localStorage-backed state that is safe during SSR and in private windows. */
export function useLocal<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key)
      if (raw) setValue(JSON.parse(raw))
    } catch {}
    setReady(true)
  }, [key])

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const v = typeof next === "function" ? (next as (p: T) => T)(prev) : next
        try {
          window.localStorage.setItem(key, JSON.stringify(v))
        } catch {}
        return v
      })
    },
    [key],
  )

  return [value, update, ready] as const
}

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
