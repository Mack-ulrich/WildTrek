"use client"

import { useEffect } from "react"
import { Button } from "@/button"
import { AlertCircle } from "lucide-react"

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <div className="py-24 flex flex-col items-center justify-center gap-4 px-4 text-center">
      <AlertCircle className="h-12 w-12 text-red-400" />
      <div>
        <h2 className="text-2xl font-bold">Something went wrong!</h2>
        <p className="text-muted-foreground mt-1">{error.message || "An unexpected error occurred"}</p>
      </div>
      <Button onClick={reset} className="bg-emerald-800 hover:bg-emerald-900">Try again</Button>
    </div>
  )
}
