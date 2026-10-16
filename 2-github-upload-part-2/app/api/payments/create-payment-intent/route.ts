import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { bookingId, amount, guideId } = await request.json()
    const stripeKey = process.env.STRIPE_SECRET_KEY

    if (!stripeKey) {
      // Mock payment for demo/testing
      return NextResponse.json({
        clientSecret: `mock_pi_${Date.now()}_secret_mock`,
        paymentIntentId: `mock_pi_${Date.now()}`,
        mock: true
      })
    }

    const Stripe = (await import("stripe")).default
    const stripe = new Stripe(stripeKey)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "usd",
      metadata: { bookingId, guideId },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
