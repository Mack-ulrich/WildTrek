import { Resend } from "resend"

const resendKey = process.env.RESEND_API_KEY
const resend = resendKey ? new Resend(resendKey) : null

export interface BookingEmailData {
  customerName: string
  customerEmail: string
  guideName: string
  guideBusinessName: string
  guideEmail: string
  bookingDetails: {
    id: string
    date: string
    time: string
    partySize: number
    totalAmount: number
    location: string
  }
}

export const sendBookingConfirmation = async (emailData: any) => {
  if (!resend) {
    console.log("Mock: Sending booking confirmation email", emailData)
    return { id: "mock-email-id", success: true }
  }
  try {
    const { data, error } = await resend.emails.send({
      from: "WildTrek <bookings@wildtrek.com>",
      to: [emailData.customerEmail],
      subject: "Booking Confirmed - Your Adventure Awaits!",
      html: `<p>Hi ${emailData.customerName}, your booking with ${emailData.guideBusinessName} is confirmed!</p>`,
    })
    if (error) throw error
    return data
  } catch (error) {
    console.error("Booking confirmation email error:", error)
    return { id: "error", success: false }
  }
}

export const sendGuideBookingNotification = async (emailData: any) => {
  if (!resend) {
    console.log("Mock: Sending guide notification email", emailData)
    return { id: "mock-email-id", success: true }
  }
  try {
    const { data, error } = await resend.emails.send({
      from: "WildTrek <notifications@wildtrek.com>",
      to: [emailData.guideEmail],
      subject: "New Booking Request",
      html: `<p>Hi ${emailData.guideName}, you have a new booking from ${emailData.customerName}!</p>`,
    })
    if (error) throw error
    return data
  } catch (error) {
    console.error("Guide notification email error:", error)
    return { id: "error", success: false }
  }
}

export const sendBookingReminder = async (data: BookingEmailData) => {
  if (!resend) {
    console.log("Mock: Sending booking reminder", data)
    return { id: "mock-email-id", success: true }
  }

  try {
    const { data: emailData, error } = await resend.emails.send({
      from: "WildTrek <reminders@wildtrek.com>",
      to: [data.customerEmail],
      subject: `Tomorrow's Fishing Trip - ${data.guideBusinessName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Trip Tomorrow!</h1>
          <p>Hi ${data.customerName},</p>
          <p>Your fishing trip with ${data.guideName} is tomorrow at ${data.bookingDetails.time} in ${data.bookingDetails.location}.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/booking/${data.bookingDetails.id}">View Trip Details</a>
        </div>
      `,
    })

    if (error) throw error
    return emailData
  } catch (error) {
    console.error("Reminder email error:", error)
    throw error
  }
}

export const sendWelcomeEmail = async (userData: any) => {
  console.log("Mock: Sending welcome email", userData)
  return { id: "mock-email-id", success: true }
}

export const sendPasswordResetEmail = async (email: string, resetLink: string) => {
  console.log("Mock: Sending password reset email", { email, resetLink })
  return { id: "mock-email-id", success: true }
}

export { resend }
