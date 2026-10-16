import Stripe from "stripe"

const stripeKey = process.env.STRIPE_SECRET_KEY || ""
const stripe = stripeKey ? new Stripe(stripeKey, { apiVersion: "2024-06-20" as Stripe.LatestApiVersion }) : (null as unknown as Stripe)

export interface PaymentIntentData {
  amount: number
  currency: string
  customerId?: string
  guideStripeAccountId: string
  applicationFeeAmount: number
  metadata: { bookingId: string; guideId: string; customerId: string }
}

export const createPaymentIntent = async (options: any) => ({
  id: "pi_mock_payment_intent",
  client_secret: "pi_mock_payment_intent_secret",
  amount: options.amount,
  currency: options.currency || "usd",
  status: "requires_payment_method",
})

export const createStripeAccount = async (guideData: any) => ({
  id: "acct_mock_account",
  type: "express",
  country: "US",
})

export const createAccountLink = async (accountId: string) => ({
  object: "account_link",
  created: Date.now(),
  expires_at: Date.now() + 3600,
  url: "https://connect.stripe.com/express/oauth/authorize?redirect_uri=https://example.com/connect/oauth&client_id=ca_mock&state=mock",
})

export const getAccountStatus = async (accountId: string) => {
  try {
    if (!stripe) return { id: accountId, charges_enabled: false, payouts_enabled: false, details_submitted: false, requirements: null }
    const account = await stripe.accounts.retrieve(accountId)
    return { id: account.id, charges_enabled: account.charges_enabled, payouts_enabled: account.payouts_enabled, details_submitted: account.details_submitted, requirements: account.requirements }
  } catch (error) {
    console.error("Stripe account status error:", error)
    throw error
  }
}

export const createCustomer = async (customerData: { email: string; name: string; phone?: string }) => {
  try {
    if (!stripe) return { id: "cus_mock", email: customerData.email, name: customerData.name }
    return await stripe.customers.create(customerData)
  } catch (error) {
    console.error("Stripe customer creation error:", error)
    throw error
  }
}

export const processRefund = async (paymentIntentId: string, amount?: number) => {
  try {
    if (!stripe) return { id: "re_mock", status: "succeeded" }
    return await stripe.refunds.create({ payment_intent: paymentIntentId, amount: amount ? Math.round(amount * 100) : undefined })
  } catch (error) {
    console.error("Stripe refund error:", error)
    throw error
  }
}

export { stripe }
