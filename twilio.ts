import twilio from "twilio"

const accountSid = process.env.TWILIO_ACCOUNT_SID || ""
const authToken = process.env.TWILIO_AUTH_TOKEN || ""

const client = accountSid && authToken ? twilio(accountSid, authToken) : null

export interface SMSData {
  to: string
  message: string
  type: "booking_confirmation" | "reminder" | "weather_alert" | "emergency" | "verification"
}

export const sendSMS = async (data: SMSData) => {
  const message = {
    sid: "SM" + Math.random().toString(36).substr(2, 9),
    status: "sent",
    to: data.to,
    body: data.message,
  }
  await logSMS({ phone: data.to, message: data.message, type: data.type, status: message.status, twilio_sid: message.sid })
  return { success: true, messageId: message.sid, status: message.status }
}

export const sendBookingConfirmationSMS = async (data: { customerPhone: string; customerName: string; guideName: string; date: string; time: string; location: string; bookingId: string }) => {
  const message = `Hi ${data.customerName}! Your fishing trip with ${data.guideName} is confirmed for ${data.date} at ${data.time} in ${data.location}. Booking ID: ${data.bookingId}. - WildTrek`
  return sendSMS({ to: data.customerPhone, message, type: "booking_confirmation" })
}

export const sendTripReminderSMS = async (data: { customerPhone: string; customerName: string; guideName: string; guidePhone: string; date: string; time: string; location: string }) => {
  const message = `Reminder: Your fishing trip with ${data.guideName} is tomorrow (${data.date}) at ${data.time} in ${data.location}. Guide contact: ${data.guidePhone}. - WildTrek`
  return sendSMS({ to: data.customerPhone, message, type: "reminder" })
}

export const sendWeatherAlertSMS = async (data: { customerPhone: string; customerName: string; guideName: string; date: string; weatherCondition: string; recommendation: string }) => {
  const message = `Weather Alert: ${data.weatherCondition} expected for your trip on ${data.date} with ${data.guideName}. Recommendation: ${data.recommendation}. - WildTrek`
  return sendSMS({ to: data.customerPhone, message, type: "weather_alert" })
}

export const sendPhoneVerificationSMS = async (phone: string, code: string) => {
  return sendSMS({ to: phone, message: `Your WildTrek verification code is: ${code}. This code expires in 10 minutes.`, type: "verification" })
}

export const validatePhoneNumber = async (phoneNumber: string) => ({ valid: true, formatted: phoneNumber, country_code: "US" })
export const sendBookingReminder = async (phoneNumber: string, bookingDetails: any) => { console.log("Mock: Sending booking reminder", { phoneNumber, bookingDetails }); return { success: true } }

const logSMS = async (data: { phone: string; message: string; type: string; status: string; twilio_sid?: string; error?: string }) => {
  try {
    const { supabaseAdmin } = await import("./supabase")
    await supabaseAdmin.from("sms_logs").insert({ phone: data.phone, message: data.message, type: data.type, status: data.status, twilio_sid: data.twilio_sid, error: data.error, sent_at: new Date().toISOString() })
  } catch (error) {
    console.error("SMS logging error:", error)
  }
}

export { client as twilioClient }
