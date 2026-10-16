import { NextRequest, NextResponse } from "next/server"
import { getGuide } from "@/lib/guides-source"

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const guide = await getGuide(id)
  if (!guide) return NextResponse.json({ error: "Guide not found" }, { status: 404 })
  return NextResponse.json({ guide })
}
