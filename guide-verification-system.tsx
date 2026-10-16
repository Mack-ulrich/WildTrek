"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/card"
import { Button } from "@/button"
import { Badge } from "@/badge"
import { Input } from "@/input"
import { Label } from "@/label"
import { CheckCircle, AlertCircle, Upload, Shield } from "lucide-react"
import { useToast } from "@/use-toast"

interface VerificationStep {
  id: string
  title: string
  description: string
  status: "pending" | "submitted" | "verified" | "rejected"
}

const STEPS: VerificationStep[] = [
  { id: "license", title: "Fishing License", description: "Upload your valid state fishing guide license", status: "pending" },
  { id: "insurance", title: "Liability Insurance", description: "Proof of commercial liability insurance", status: "pending" },
  { id: "identity", title: "Identity Verification", description: "Government-issued photo ID", status: "pending" },
  { id: "background", title: "Background Check", description: "Consent to background screening", status: "pending" },
]

const statusConfig = {
  pending: { label: "Pending", color: "text-gray-500", bg: "bg-gray-100" },
  submitted: { label: "Under Review", color: "text-yellow-700", bg: "bg-yellow-100" },
  verified: { label: "Verified", color: "text-green-700", bg: "bg-green-100" },
  rejected: { label: "Rejected", color: "text-red-700", bg: "bg-red-100" },
}

export function GuideVerificationSystem() {
  const [steps, setSteps] = useState<VerificationStep[]>(STEPS)
  const [uploading, setUploading] = useState<string | null>(null)
  const { toast } = useToast()

  const handleUpload = async (stepId: string, file: File) => {
    setUploading(stepId)
    // Simulate upload
    await new Promise(r => setTimeout(r, 1500))
    setSteps(prev => prev.map(s => s.id === stepId ? { ...s, status: "submitted" } : s))
    setUploading(null)
    toast({ title: "Document submitted", description: "We'll review your document within 1-2 business days." })
  }

  const allVerified = steps.every(s => s.status === "verified")
  const progress = steps.filter(s => s.status === "verified").length

  return (
    <div className="space-y-4">
      <Card className={allVerified ? "border-green-300 bg-green-50" : ""}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className={`h-5 w-5 ${allVerified ? "text-green-600" : "text-gray-400"}`} />
            Guide Verification
            <Badge variant="outline" className="ml-auto text-xs">{progress}/{steps.length} Complete</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {allVerified ? (
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">You are fully verified! Your profile now shows a verified badge.</span>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Complete all steps to become a verified guide and increase booking rates by up to 40%.</p>
          )}
          <div className="mt-3 bg-gray-200 rounded-full h-2">
            <div className="bg-green-500 rounded-full h-2 transition-all" style={{ width: `${(progress/steps.length)*100}%` }} />
          </div>
        </CardContent>
      </Card>

      {steps.map(step => {
        const cfg = statusConfig[step.status]
        return (
          <Card key={step.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`rounded-full p-1.5 flex-shrink-0 ${cfg.bg}`}>
                  {step.status === "verified" ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : step.status === "rejected" ? (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  ) : (
                    <Shield className={`h-4 w-4 ${cfg.color}`} />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm">{step.title}</h4>
                    <Badge className={`text-xs ${cfg.bg} ${cfg.color} border-0`}>{cfg.label}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                  {(step.status === "pending" || step.status === "rejected") && (
                    <Label className="cursor-pointer mt-2 block">
                      <div className="flex items-center gap-2 text-xs text-green-600 hover:text-green-700">
                        <Upload className="h-3.5 w-3.5" />
                        {uploading === step.id ? "Uploading..." : "Upload Document"}
                      </div>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        disabled={uploading === step.id}
                        onChange={e => { if (e.target.files?.[0]) handleUpload(step.id, e.target.files[0]) }}
                      />
                    </Label>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
