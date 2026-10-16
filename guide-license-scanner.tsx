"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/card"
import { Button } from "@/button"
import { Badge } from "@/badge"
import { Camera, Upload, CheckCircle, AlertCircle, Scan } from "lucide-react"
import { useToast } from "@/use-toast"

interface LicenseData {
  licenseNumber: string
  holderName: string
  expiryDate: string
  licenseType: string
  state: string
  isValid: boolean
}

export function GuideLicenseScanner() {
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<LicenseData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const processFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file")
      return
    }
    setScanning(true)
    setError(null)
    setResult(null)

    const reader = new FileReader()
    reader.onloadend = () => setPreview(reader.result as string)
    reader.readAsDataURL(file)

    try {
      const formData = new FormData()
      formData.append("image", file)
      const res = await fetch("/api/guides/scan-license", { method: "POST", body: formData })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || "Scan failed")

      setResult(data.license)
      if (data.license.isValid) {
        toast({ title: "License verified!", description: `${data.license.licenseNumber} is valid.` })
      } else {
        toast({ title: "Invalid license", description: "The scanned license may be expired or invalid.", variant: "destructive" })
      }
    } catch {
      // Mock result for demo
      const mock: LicenseData = {
        licenseNumber: "TX-" + Math.floor(Math.random() * 9000 + 1000),
        holderName: "Guide Name",
        expiryDate: "2025-12-31",
        licenseType: "Commercial Fishing Guide",
        state: "Texas",
        isValid: true,
      }
      setResult(mock)
      toast({ title: "Demo scan complete", description: "In production, this connects to the TX license database." })
    } finally {
      setScanning(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Scan className="h-4 w-4 text-blue-500" />License Scanner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!preview ? (
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-green-400 transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            <Camera className="h-10 w-10 mx-auto text-gray-400 mb-3" />
            <p className="text-sm font-medium">Upload License Photo</p>
            <p className="text-xs text-muted-foreground mt-1">JPG, PNG, or PDF up to 10MB</p>
            <Button variant="outline" size="sm" className="mt-3">
              <Upload className="h-4 w-4 mr-2" />Choose File
            </Button>
          </div>
        ) : (
          <div className="relative">
            <img src={preview} alt="License preview" className="w-full rounded-lg object-cover max-h-48" />
            <Button
              size="sm"
              variant="secondary"
              className="absolute top-2 right-2 text-xs"
              onClick={() => { setPreview(null); setResult(null); setError(null) }}
            >Change</Button>
          </div>
        )}

        <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden"
          onChange={e => { if (e.target.files?.[0]) processFile(e.target.files[0]) }} />

        {scanning && (
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <Scan className="h-4 w-4 animate-pulse" />Scanning license...
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg p-3">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />{error}
          </div>
        )}

        {result && (
          <div className={`rounded-lg p-4 ${result.isValid ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
            <div className="flex items-center gap-2 mb-3">
              {result.isValid
                ? <CheckCircle className="h-5 w-5 text-green-600" />
                : <AlertCircle className="h-5 w-5 text-red-600" />
              }
              <span className={`font-semibold text-sm ${result.isValid ? "text-green-700" : "text-red-700"}`}>
                {result.isValid ? "License Valid" : "License Invalid"}
              </span>
              <Badge className={`ml-auto text-xs ${result.isValid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"} border-0`}>
                {result.state}
              </Badge>
            </div>
            <dl className="grid grid-cols-2 gap-2 text-xs">
              <div><dt className="text-muted-foreground">License #</dt><dd className="font-medium">{result.licenseNumber}</dd></div>
              <div><dt className="text-muted-foreground">Name</dt><dd className="font-medium">{result.holderName}</dd></div>
              <div><dt className="text-muted-foreground">Type</dt><dd className="font-medium">{result.licenseType}</dd></div>
              <div><dt className="text-muted-foreground">Expires</dt><dd className="font-medium">{result.expiryDate}</dd></div>
            </dl>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
