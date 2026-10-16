import { NextRequest, NextResponse } from "next/server"

const SYSTEM_PROMPT = `You are a knowledgeable fishing guide assistant for WildTrek, a fishing guide booking platform focused on Texas Gulf Coast fishing. You help users with:
- Finding the best fishing spots in Texas (Corpus Christi, Port Aransas, Galveston, South Padre Island, Rockport)
- Gear recommendations for different fishing types
- Species information (redfish, speckled trout, flounder, tarpon, snapper, etc.)
- Seasonal fishing patterns and tides
- What to expect when booking a fishing guide
- Safety on the water
Keep responses friendly, helpful, and focused on fishing. Recommend booking through WildTrek when appropriate.`

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()
    const apiKey = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY

    if (!apiKey) {
      const userMsg = messages[messages.length - 1]?.content || ""
      return NextResponse.json({
        response: getFallbackResponse(userMsg)
      })
    }

    // Use OpenAI if available
    if (process.env.OPENAI_API_KEY) {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages.slice(-10)],
          max_tokens: 500,
          temperature: 0.7,
        }),
      })
      const data = await res.json()
      return NextResponse.json({ response: data.choices?.[0]?.message?.content || getFallbackResponse("") })
    }

    return NextResponse.json({ response: getFallbackResponse(messages[messages.length - 1]?.content || "") })
  } catch {
    return NextResponse.json({ response: "I'm having trouble connecting right now. Please try again!" })
  }
}

function getFallbackResponse(query: string): string {
  const q = query.toLowerCase()
  if (q.includes("redfish") || q.includes("red drum")) {
    return "Redfish (red drum) are one of Texas\'s most popular sport fish! Best caught in the bays and inshore areas. Look for them near grass flats, oyster reefs, and marshes. Fall (Sept-Nov) is peak season. They love crab, shrimp, and mullet as bait."
  }
  if (q.includes("time") || q.includes("season") || q.includes("when")) {
    return "Texas fishing is great year-round! Spring (March-May) is excellent for speckled trout. Summer brings tarpon and offshore species. Fall (Sept-Nov) is prime redfish season. Winter is great for flounder and sheepshead."
  }
  if (q.includes("gear") || q.includes("equipment") || q.includes("rod") || q.includes("reel")) {
    return "For inshore Texas fishing, a 7\' medium-light spinning rod with 12-20 lb braided line is versatile. For offshore, go heavier — 30-50 lb class. Your guide will typically provide all gear when you book through WildTrek!"
  }
  if (q.includes("guide") || q.includes("book") || q.includes("find")) {
    return "WildTrek has verified fishing guides across the Texas Gulf Coast! Filter by location, specialty, and price. All guides are licensed and vetted. Check reviews and ratings to find your perfect match. Most guides provide all gear, bait, and licenses!"
  }
  return "Great question! For the best fishing advice specific to your trip, I recommend booking a consultation with one of WildTrek\'s expert guides. They know the local waters inside and out!"
}
