"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"

const routeLabels: Record<string, string> = {
  guides: "Find Guides",
  guide: "Guide",
  dashboard: "Dashboard",
  bookings: "Bookings",
  profile: "Profile",
  settings: "Settings",
  auth: "Auth",
  signin: "Sign In",
  signup: "Sign Up",
  admin: "Admin",
  cave: "The Cave",
  vibes: "Vibes Feed",
}

export function BreadcrumbNav() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  if (segments.length === 0) return null

  const breadcrumbs = segments.map((seg, idx) => ({
    label: routeLabels[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " "),
    href: "/" + segments.slice(0, idx + 1).join("/"),
    isLast: idx === segments.length - 1,
  }))

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground px-4 py-2">
      <Link href="/" className="flex items-center hover:text-foreground transition-colors">
        <Home className="h-4 w-4" />
      </Link>
      {breadcrumbs.map((crumb) => (
        <div key={crumb.href} className="flex items-center space-x-1">
          <ChevronRight className="h-4 w-4" />
          {crumb.isLast ? (
            <span className="text-foreground font-medium">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="hover:text-foreground transition-colors">{crumb.label}</Link>
          )}
        </div>
      ))}
    </nav>
  )
}
