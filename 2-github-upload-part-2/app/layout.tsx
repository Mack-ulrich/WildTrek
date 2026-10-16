import type { Metadata } from "next"
import { Inter, Barlow_Condensed } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/toaster"
import { ThemeProvider } from "@/theme-provider"
import { AuthProvider } from "@/auth-context"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { SyncPrompt } from "@/components/sync-prompt"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
const display = Barlow_Condensed({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-display" })

// Season status and "current month" highlights depend on today's date.
export const revalidate = 3600

export const metadata: Metadata = {
  title: { default: "WildTrek — Fish, Hunt & Explore Texas", template: "%s · WildTrek" },
  description:
    "Book verified fishing and hunting guides, check live tides and solunar times, learn every species, and log your catches and harvests across Texas.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} ${inter.variable} ${display.variable}`}>
        <ThemeProvider attribute="class" forcedTheme="light" defaultTheme="light" disableTransitionOnChange>
          <AuthProvider>
            <div className="flex min-h-screen flex-col">
              <SiteHeader />
              <main className="flex-1">{children}</main>
              <SiteFooter />
            </div>
            <SyncPrompt />
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
