interface WeatherData {
  current: {
    temp: number; feels_like: number; humidity: number; pressure: number; visibility: number
    wind_speed: number; wind_deg: number; weather: Array<{ main: string; description: string; icon: string }>
  }
  daily: Array<{
    dt: number; temp: { day: number; min: number; max: number }
    weather: Array<{ main: string; description: string; icon: string }>
    wind_speed: number; humidity: number; pressure: number
  }>
}

interface FishingConditions {
  rating: "poor" | "fair" | "good" | "excellent"
  score: number
  factors: { pressure: number; wind: number; temperature: number; humidity: number }
  recommendation: string
}

export class WeatherService {
  private apiKey: string
  private baseUrl = "https://api.openweathermap.org/data/3.0/onecall"

  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY || ""
  }

  async getWeatherData(lat: number, lon: number): Promise<WeatherData> {
    if (!this.apiKey) throw new Error("OpenWeatherMap API key is required")
    const url = `${this.baseUrl}?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=imperial&exclude=minutely,hourly,alerts`
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Weather API error: ${response.statusText}`)
    return response.json()
  }

  calculateFishingConditions(weather: WeatherData): FishingConditions {
    const { current } = weather
    const pressureInHg = current.pressure * 0.02953
    let pressureScore = pressureInHg >= 29.7 && pressureInHg <= 30.4 ? 100 : pressureInHg >= 29.4 && pressureInHg <= 30.7 ? 75 : pressureInHg >= 29.0 && pressureInHg <= 31.0 ? 50 : 25
    const windMph = current.wind_speed
    let windScore = windMph >= 5 && windMph <= 15 ? 100 : windMph <= 20 ? 75 : windMph <= 25 ? 50 : 25
    let tempScore = current.temp >= 65 && current.temp <= 85 ? 100 : current.temp >= 55 && current.temp <= 95 ? 75 : current.temp >= 45 && current.temp <= 105 ? 50 : 25
    let humidityScore = current.humidity >= 40 && current.humidity <= 70 ? 100 : current.humidity >= 30 && current.humidity <= 80 ? 75 : 50
    const totalScore = (pressureScore + windScore + tempScore + humidityScore) / 4
    const rating: FishingConditions["rating"] = totalScore >= 85 ? "excellent" : totalScore >= 70 ? "good" : totalScore >= 50 ? "fair" : "poor"
    const recommendation = { excellent: "Perfect conditions for fishing! Fish are likely to be very active.", good: "Good fishing conditions. Fish should be moderately active.", fair: "Fair conditions. Fish may be less active but still catchable.", poor: "Challenging conditions. Consider rescheduling if possible." }[rating]
    return { rating, score: Math.round(totalScore), factors: { pressure: Math.round(pressureScore), wind: Math.round(windScore), temperature: Math.round(tempScore), humidity: Math.round(humidityScore) }, recommendation }
  }

  async getFishingForecast(lat: number, lon: number) {
    const weather = await this.getWeatherData(lat, lon)
    const conditions = this.calculateFishingConditions(weather)
    return {
      current: { temperature: Math.round(weather.current.temp), feelsLike: Math.round(weather.current.feels_like), humidity: weather.current.humidity, pressure: Math.round(weather.current.pressure * 0.02953 * 100) / 100, windSpeed: Math.round(weather.current.wind_speed), windDirection: weather.current.wind_deg, visibility: Math.round(weather.current.visibility * 0.000621371), description: weather.current.weather[0].description, icon: weather.current.weather[0].icon },
      fishing: conditions,
      forecast: weather.daily.slice(0, 5).map((day) => ({ date: new Date(day.dt * 1000), high: Math.round(day.temp.max), low: Math.round(day.temp.min), description: day.weather[0].description, icon: day.weather[0].icon, windSpeed: Math.round(day.wind_speed), humidity: day.humidity, pressure: Math.round(day.pressure * 0.02953 * 100) / 100 })),
    }
  }
}
