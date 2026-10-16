"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/dropdown-menu"
import { Button } from "@/button"
import { useAuth } from "@/auth-context"
import {
  Menu, Fish, Crosshair, Users, CloudSun, BookOpen, MapPin, NotebookPen, Backpack, CalendarRange, Newspaper, MessageCircle, ChevronDown, Mountain, LayoutDashboard, HelpCircle,
} from "lucide-react"

const PRIMARY = [
  { href: "/fishing", label: "Fish", icon: Fish },
  { href: "/hunting", label: "Hunt", icon: Crosshair },
  { href: "/guides", label: "Guides", icon: Users },
  { href: "/conditions", label: "Conditions", icon: CloudSun },
  { href: "/species", label: "Field Guide", icon: BookOpen },
  { href: "/locations", label: "Spots", icon: MapPin },
]

const MORE = [
  { href: "/logbook", label: "My Logbook", icon: NotebookPen, desc: "Log catches & harvests" },
  { href: "/gear", label: "Gear Lists", icon: Backpack, desc: "Trip checklists" },
  { href: "/regulations", label: "Seasons & Regs", icon: CalendarRange, desc: "2026–27 dates & limits" },
  { href: "/cave", label: "The Cave", icon: Newspaper, desc: "How-tos from guides" },
  { href: "/vibes", label: "Vibes", icon: MessageCircle, desc: "Community catch feed" },
  { href: "/how-it-works", label: "How It Works", icon: HelpCircle, desc: "Booking & verification" },
]

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-800 text-amber-100 shadow-sm">
        <Mountain className="h-5 w-5" />
      </span>
      <span className="font-display text-2xl font-bold tracking-tight text-stone-900">
        Wild<span className="text-orange-600">Trek</span>
      </span>
    </Link>
  )
}

export function SiteHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const { user } = useAuth()
  const active = (href: string) => pathname === href || pathname.startsWith(href + "/")

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-[#fbf9f4]/90 backdrop-blur supports-[backdrop-filter]:bg-[#fbf9f4]/75">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex">
          {PRIMARY.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                active(href) ? "bg-emerald-900/10 text-emerald-900" : "text-stone-700 hover:bg-stone-900/5 hover:text-stone-900"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-stone-700 outline-none hover:bg-stone-900/5">
              More <ChevronDown className="h-3.5 w-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              {MORE.map(({ href, label, icon: Icon, desc }) => (
                <DropdownMenuItem key={href} asChild>
                  <Link href={href} className="flex items-start gap-3 py-2">
                    <Icon className="mt-0.5 h-4 w-4 text-emerald-800" />
                    <span>
                      <span className="block text-sm font-medium">{label}</span>
                      <span className="block text-xs text-muted-foreground">{desc}</span>
                    </span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {user ? (
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard"><LayoutDashboard className="mr-1.5 h-4 w-4" />Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm"><Link href="/auth/login">Sign in</Link></Button>
              <Button asChild size="sm" className="bg-orange-600 text-white hover:bg-orange-700"><Link href="/auth/register">Join free</Link></Button>
            </>
          )}
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu"><Menu className="h-6 w-6" /></Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 overflow-y-auto bg-[#fbf9f4]">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <div className="mb-6"><Logo /></div>
            <div className="space-y-1">
              {[...PRIMARY, ...MORE, { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }].map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${active(href) ? "bg-emerald-900/10 text-emerald-900" : "text-stone-700 hover:bg-stone-900/5"}`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
            </div>
            {!user && (
              <div className="mt-6 grid gap-2 border-t pt-6">
                <Button asChild variant="outline"><Link href="/auth/login" onClick={() => setOpen(false)}>Sign in</Link></Button>
                <Button asChild className="bg-orange-600 text-white hover:bg-orange-700"><Link href="/auth/register" onClick={() => setOpen(false)}>Join free</Link></Button>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
