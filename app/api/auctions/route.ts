import { getSupabaseServer } from "@/lib/supabase-server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServer()

    const { data, error } = await supabase
      .from("auctions")
      .select("*, listings(title, image_urls, price)")
      .eq("status", "active")
      .order("end_time", { ascending: true })
      .limit(50)

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Auctions API error:", error)
    return NextResponse.json({ error: "Failed to fetch auctions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServer()
    const body = await request.json()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase.from("auctions").insert([
      {
        listing_id: body.listing_id,
        seller_id: user.id,
        starting_price: body.starting_price,
        start_time: body.start_time,
        end_time: body.end_time,
      },
    ])

    if (error) throw error

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error("Create auction error:", error)
    return NextResponse.json({ error: "Failed to create auction" }, { status: 500 })
  }
}
