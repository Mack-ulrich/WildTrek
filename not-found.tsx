import Link from "next/link"
import { Button } from "@/button"
import { Fish } from "lucide-react"

export default function NotFound() {
  return (
    <div className="py-24 flex flex-col items-center justify-center gap-6 px-4 text-center">
      <Fish className="h-16 w-16 text-emerald-300" />
      <div>
        <h1 className="text-4xl font-bold text-gray-900">404</h1>
        <p className="text-xl text-muted-foreground mt-2">This page got away...</p>
        <p className="text-sm text-muted-foreground mt-1">The page you're looking for doesn't exist or has moved.</p>
      </div>
      <Link href="/"><Button className="bg-emerald-800 hover:bg-emerald-900">Go Fishing (Home)</Button></Link>
    </div>
  )
}
