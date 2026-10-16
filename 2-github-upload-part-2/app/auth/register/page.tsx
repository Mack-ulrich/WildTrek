"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/card"
import { Button } from "@/button"
import { Input } from "@/input"
import { Label } from "@/label"
import { RadioGroup, RadioGroupItem } from "@/radio-group"
import { useToast } from "@/use-toast"
import { Fish } from "lucide-react"
import { supabase } from "@/supabase"

export default function RegisterPage() {
  // useSearchParams needs a Suspense boundary so the page can still be prerendered.
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  )
}

function RegisterForm() {
  const params = useSearchParams()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<"customer" | "guide">(params.get("role") === "guide" ? "guide" : "customer")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) {
      toast({ title: "Accounts are coming soon", description: "Sign-in isn't connected yet. Your logbook, gear lists and trip requests still save on this device." })
      return
    }
    setLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: name, role } }
      })
      if (error) throw error
      toast({ title: "Account created!", description: "Check your email to confirm your account." })
      router.push("/auth/login")
    } catch (err: any) {
      toast({ title: "Registration failed", description: err.message, variant: "destructive" })
    } finally { setLoading(false) }
  }

  return (
    <div className="flex items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <div className="h-12 w-12 rounded-full bg-emerald-800 flex items-center justify-center">
              <Fish className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">{role === "guide" ? "Apply as a guide" : "Join WildTrek"}</CardTitle>
          <CardDescription>{role === "guide" ? "List your trips and take bookings from Texas anglers and hunters" : "Fish, hunt and explore Texas"}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label>I am a...</Label>
              <RadioGroup value={role} onValueChange={v => setRole(v as any)} className="flex gap-4">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="customer" id="customer" />
                  <Label htmlFor="customer">Angler / Hunter</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="guide" id="guide" />
                  <Label htmlFor="guide">Guide / Outfitter</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="John Smith" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 8 characters" minLength={8} required />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-emerald-800 hover:bg-emerald-900">
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link href="/auth/login" className="text-emerald-800 hover:underline font-medium">Sign in</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
