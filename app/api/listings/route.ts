import { getSupabaseServer } from "@/lib/supabase-server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServer()
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get("category")
    const status = searchParams.get("status") || "active"

    let query = supabase.from("listings").select("*").eq("status", status).eq("is_auction", false)

    if (category && category !== "all") {
      query = query.eq("category", category)
    }

    const { data, error } = await query.order("created_at", { ascending: false }).limit(50)

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Listings API error:", error)
    return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 })
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

    const { data, error } = await supabase.from("listings").insert([
      {
        user_id: user.id,
        title: body.title,
        description: body.description,
        category: body.category,
        price: body.price,
        image_urls: body.image_urls,
        condition: body.condition,
      },
    ])

    if (error) throw error

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error("Create listing error:", error)
    return NextResponse.json({ error: "Failed to create listing" }, { status: 500 })
  }
}
