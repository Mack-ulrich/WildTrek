"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { cn } from "@/utils"

interface StarRatingProps { value?: number; onChange?: (value: number) => void; max?: number; readOnly?: boolean; className?: string }

export function StarRating({ value = 0, onChange, max = 5, readOnly = false, className }: StarRatingProps) {
  const [hovered, setHovered] = useState(0)

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readOnly && onChange?.(star)}
          onMouseEnter={() => !readOnly && setHovered(star)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          className={cn("focus:outline-none", readOnly ? "cursor-default" : "cursor-pointer")}
          disabled={readOnly}
        >
          <Star className={cn("h-5 w-5 transition-colors", (hovered || value) >= star ? "fill-yellow-400 text-yellow-400" : "text-gray-300")} />
        </button>
      ))}
    </div>
  )
}
