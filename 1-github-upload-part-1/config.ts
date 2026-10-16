export const config = {
  app: {
    name: "WildTrek",
    description: "Premium fishing guide booking platform",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
  },
  auth: {
    supabase: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    },
  },
  payments: {
    stripe: {
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
    },
  },
  features: {
    enableWeather: !!process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY,
    enableSMS: !!process.env.TWILIO_ACCOUNT_SID,
    enableMaps: !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  },
} as const

export type Config = typeof config
