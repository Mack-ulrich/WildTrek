// Real API integration layer

export interface CreateBookingRequest {
  guideId: string
  customerId: string
  date: string
  timeSlot: string
  partySize: number
  baseAmount: number
  serviceFee: number
  taxAmount: number
  totalAmount: number
  specialRequests?: string
  paymentMethodId?: string
}

export class BookingAPI {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api"

  private getToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem("auth_token")
  }

  async createBooking(bookingData: CreateBookingRequest) {
    const token = this.getToken()
    const response = await fetch(`${this.baseUrl}/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(bookingData),
    })

    if (!response.ok) {
      throw new Error("Failed to create booking")
    }

    return response.json()
  }

  async getBookings(userId: string) {
    const token = this.getToken()
    const response = await fetch(`${this.baseUrl}/bookings?userId=${userId}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })

    return response.json()
  }
}

export const bookingAPI = new BookingAPI()
