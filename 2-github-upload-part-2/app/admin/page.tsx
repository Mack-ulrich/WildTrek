"use client"

import { GuideApprovalSystem } from "@/guide-approval-system"
import { MetricsCard } from "@/metrics-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/tabs"
import { Users, Fish, Calendar, DollarSign, Shield } from "lucide-react"
import { useAuth } from "@/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AdminPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.push("/auth/login")
  }, [user, loading, router])

  if (loading) return null

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center gap-3">
          <Shield className="h-7 w-7 text-green-600" />
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricsCard title="Total Users" value="1,247" change="+48 this week" changeType="positive" icon={Users} />
          <MetricsCard title="Active Guides" value="89" change="+5 pending approval" changeType="neutral" icon={Fish} />
          <MetricsCard title="Bookings (Month)" value="342" change="+18% vs last month" changeType="positive" icon={Calendar} />
          <MetricsCard title="Revenue (Month)" value="$28,450" change="+$4,200 vs last month" changeType="positive" icon={DollarSign} />
        </div>

        <Tabs defaultValue="guides">
          <TabsList>
            <TabsTrigger value="guides">Guide Approvals</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="verification">Verification</TabsTrigger>
          </TabsList>
          <TabsContent value="guides" className="mt-6">
            <GuideApprovalSystem />
          </TabsContent>
          <TabsContent value="users" className="mt-6">
            <p className="text-muted-foreground text-center py-8">User management coming soon</p>
          </TabsContent>
          <TabsContent value="bookings" className="mt-6">
            <p className="text-muted-foreground text-center py-8">Booking management coming soon</p>
          </TabsContent>
          <TabsContent value="verification" className="mt-6">
            <p className="text-muted-foreground text-center py-8">Verification queue coming soon</p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
