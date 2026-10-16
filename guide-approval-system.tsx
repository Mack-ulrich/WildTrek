"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/card"
import { Button } from "@/button"
import { Badge } from "@/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/avatar"
import { CheckCircle, XCircle, Clock, User } from "lucide-react"

interface PendingGuide {
  id: string
  name: string
  email: string
  avatar?: string
  location: string
  yearsExperience: number
  submittedAt: string
  licenseNumber?: string
  specialties: string[]
}

const mockPending: PendingGuide[] = [
  { id: "1", name: "Jake Martinez", email: "jake@example.com", location: "Corpus Christi, TX", yearsExperience: 8, submittedAt: "2024-01-15", licenseNumber: "TX-4521", specialties: ["Offshore", "Bay Fishing"] },
  { id: "2", name: "Sarah Connor", email: "sarah@example.com", location: "Port Aransas, TX", yearsExperience: 12, submittedAt: "2024-01-18", licenseNumber: "TX-8834", specialties: ["Inshore", "Fly Fishing"] },
]

export function GuideApprovalSystem() {
  const [pending, setPending] = useState<PendingGuide[]>(mockPending)
  const [processing, setProcessing] = useState<string | null>(null)

  const handleApprove = async (id: string) => {
    setProcessing(id)
    await new Promise(r => setTimeout(r, 1000))
    setPending(p => p.filter(g => g.id !== id))
    setProcessing(null)
  }

  const handleReject = async (id: string) => {
    setProcessing(id)
    await new Promise(r => setTimeout(r, 1000))
    setPending(p => p.filter(g => g.id !== id))
    setProcessing(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-orange-500" />
        <h2 className="text-lg font-semibold">Pending Guide Applications ({pending.length})</h2>
      </div>

      {pending.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">No pending applications</CardContent></Card>
      ) : (
        pending.map(guide => (
          <Card key={guide.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={guide.avatar} />
                  <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{guide.name}</h3>
                    {guide.licenseNumber && <Badge variant="outline" className="text-xs">License: {guide.licenseNumber}</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{guide.email} · {guide.location}</p>
                  <p className="text-sm text-gray-600 mb-2">{guide.yearsExperience} years experience</p>
                  <div className="flex flex-wrap gap-1">
                    {guide.specialties.map(s => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Submitted {guide.submittedAt}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    disabled={processing === guide.id}
                    onClick={() => handleReject(guide.id)}
                  >
                    <XCircle className="h-4 w-4 mr-1" />Reject
                  </Button>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    disabled={processing === guide.id}
                    onClick={() => handleApprove(guide.id)}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />Approve
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
