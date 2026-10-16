import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get("lat") || "27.8006"
  const lng = searchParams.get("lng") || "-97.3964"
  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY

  if (!apiKey) {
    return NextResponse.json({
      temp: 75,
      feels_like: 78,
      humidity: 65,
      wind_speed: 8,
      wind_deg: 135,
      visibility: 10000,
      description: "partly cloudy",
      icon: "02d",
    })
  }

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=imperial&appid=${apiKey}`,
      { next: { revalidate: 1800 } }
    )
    if (!res.ok) throw new Error("Weather API error")
    const data = await res.json()
    return NextResponse.json({
      temp: data.main.temp,
      feels_like: data.main.feels_like,
      humidity: data.main.humidity,
      wind_speed: data.wind.speed,
      wind_deg: data.wind.deg,
      visibility: data.visibility,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
    })
  } catch (error) {
    return NextResponse.json({ error: "Weather unavailable" }, { status: 503 })
  }
}
