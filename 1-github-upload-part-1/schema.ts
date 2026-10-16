export interface UserProfile {
  bio: string
  profilePicture?: string
  contactNumber?: string
}

export interface GuideAvailability {
  date: Date
  timeSlots: TimeSlot[]
}

export interface TimeSlot {
  startTime: Date
  endTime: Date
}

export interface User {
  id: string
  email: string
  name: string
  role: "customer" | "guide" | "outfitter" | "admin"
  profile: UserProfile
  createdAt: Date
  updatedAt: Date
}

export interface Guide {
  id: string
  userId: string
  businessName?: string
  description: string
  specialties: string[]
  location: string
  yearsExperience: number
  isVerified: boolean
  isApproved: boolean
  rating: number
  totalReviews: number
  availability: GuideAvailability[]
  createdAt: Date
  updatedAt: Date
}

export interface Booking {
  id: string
  customerId: string
  guideId: string
  date: Date
  timeSlot: TimeSlot
  partySize: number
  totalAmount: number
  status: "pending" | "confirmed" | "completed" | "cancelled"
  paymentStatus: "pending" | "paid" | "refunded"
  specialRequests?: string
  createdAt: Date
  updatedAt: Date
}

export interface Review {
  id: string
  bookingId: string
  customerId: string
  guideId: string
  rating: number
  comment: string
  photos?: string[]
  isVerified: boolean
  createdAt: Date
}
