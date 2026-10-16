// Email service integration — null-guarded for missing API key
import { Resend } from "resend"

const resendKey = process.env.RESEND_API_KEY
const resend = resendKey ? new Resend(resendKey) : null

export class EmailService {
  async sendBookingConfirmation(booking: any, customer: any, guide: any) {
    if (!resend) {
      console.log("Mock: Sending booking confirmation email", { customer: customer.email })
      return { id: "mock-email-id", success: true }
    }
    try {
      const { data, error } = await resend.emails.send({
        from: "WildTrek <bookings@wildtrek.com>",
        to: [customer.email],
        subject: "Booking Confirmed - Your Adventure Awaits!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #16a34a;">Booking Confirmed! 🎣</h1>
            <p>Hi ${customer.name},</p>
            <p>Your booking with ${guide.business_name || guide.name} has been confirmed!</p>

            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Trip Details</h3>
              <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</p>
              <p><strong>Time:</strong> ${booking.time_slot}</p>
              <p><strong>Party Size:</strong> ${booking.party_size} people</p>
              <p><strong>Total Amount:</strong> $${booking.total_amount}</p>
            </div>

            <p>Your guide will contact you 24 hours before the trip with final details.</p>
            <p>Happy fishing!</p>
            <p>The WildTrek Team</p>
          </div>
        `,
      })

      if (error) {
        throw error
      }

      return data
    } catch (error) {
      console.error("Email send error:", error)
      throw error
    }
  }

  async sendGuideNotification(booking: any, guide: any) {
    if (!resend) {
      console.log("Mock: Sending guide notification email", { guide: guide.email })
      return { id: "mock-email-id", success: true }
    }
    try {
      const { data, error } = await resend.emails.send({
        from: "WildTrek <notifications@wildtrek.com>",
        to: [guide.email],
        subject: "New Booking Request",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">New Booking Request 📅</h1>
            <p>Hi ${guide.name},</p>
            <p>You have a new booking request!</p>

            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Booking Details</h3>
              <p><strong>Customer:</strong> ${booking.customer_name}</p>
              <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</p>
              <p><strong>Party Size:</strong> ${booking.party_size} people</p>
              <p><strong>Amount:</strong> $${booking.total_amount}</p>
            </div>

            <a href="${process.env.NEXT_PUBLIC_APP_URL}/guide/dashboard"
               style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View & Respond
            </a>
          </div>
        `,
      })

      return data
    } catch (error) {
      console.error("Guide notification error:", error)
      throw error
    }
  }
}

export const emailService = new EmailService()
