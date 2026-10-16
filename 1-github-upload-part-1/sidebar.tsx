"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/utils"
import { Button } from "@/button"
import { ScrollArea } from "@/scroll-area"
import {
  Home, Fish, Calendar, MessageSquare, Star, Settings,
  BarChart3, Users, MapPin, BookOpen, ChevronLeft, ChevronRight,
  Shield, Bell
} from "lucide-react"

interface SidebarLink { href: string; label: string; icon: React.ElementType; badge?: number }

const customerLinks: SidebarLink[] = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/guides", label: "Find Guides", icon: Fish },
  { href: "/bookings", label: "My Bookings", icon: Calendar },
  { href: "/reviews", label: "Reviews", icon: Star },
  { href: "/messages", label: "Messages", icon: MessageSquare, badge: 2 },
  { href: "/settings", label: "Settings", icon: Settings },
]

const guideLinks: SidebarLink[] = [
  { href: "/guide/dashboard", label: "Dashboard", icon: Home },
  { href: "/guide/bookings", label: "Bookings", icon: Calendar },
  { href: "/guide/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/guide/customers", label: "Customers", icon: Users },
  { href: "/guide/locations", label: "Locations", icon: MapPin },
  { href: "/guide/messages", label: "Messages", icon: MessageSquare, badge: 3 },
  { href: "/guide/settings", label: "Settings", icon: Settings },
]

const adminLinks: SidebarLink[] = [
  { href: "/admin", label: "Overview", icon: Home },
  { href: "/admin/guides", label: "Guides", icon: Fish },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/bookings", label: "Bookings", icon: Calendar },
  { href: "/admin/content", label: "Content", icon: BookOpen },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/security", label: "Security", icon: Shield },
]

interface SidebarProps {
  role?: "customer" | "guide" | "admin"
}

export function Sidebar({ role = "customer" }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  const links = role === "admin" ? adminLinks : role === "guide" ? guideLinks : customerLinks

  return (
    <aside className={cn(
      "flex flex-col border-r bg-background transition-all duration-300 h-full",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && <span className="font-bold text-green-600">WildTrek</span>}
        <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)} className="ml-auto">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <nav className="p-2 space-y-1">
          {links.map(({ href, label, icon: Icon, badge }) => {
            const active = pathname === href || pathname.startsWith(href + "/")
            return (
              <Link key={href} href={href}>
                <span className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors relative",
                  active ? "bg-green-50 text-green-700" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}>
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {!collapsed && <span>{label}</span>}
                  {badge && !collapsed && (
                    <span className="ml-auto bg-green-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center">{badge}</span>
                  )}
                </span>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>
    </aside>
  )
}
