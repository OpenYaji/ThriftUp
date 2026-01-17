import { getSupabaseServer } from "@/lib/supabase-server"
import { type NextRequest, NextResponse } from "next/server"

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

    // Get current auction
    const { data: auction, error: auctionError } = await supabase
      .from("auctions")
      .select("*")
      .eq("id", body.auction_id)
      .single()

    if (auctionError || !auction) {
      return NextResponse.json({ error: "Auction not found" }, { status: 404 })
    }

    // Validate bid amount
    const minBid = auction.current_bid ? auction.current_bid + 1 : auction.starting_price
    if (body.bid_amount < minBid) {
      return NextResponse.json({ error: "Bid too low" }, { status: 400 })
    }

    // Create bid
    const { data: bid, error: bidError } = await supabase.from("bids").insert([
      {
        auction_id: body.auction_id,
        bidder_id: user.id,
        bid_amount: body.bid_amount,
      },
    ])

    if (bidError) throw bidError

    // Update auction
    await supabase
      .from("auctions")
      .update({
        current_bid: body.bid_amount,
        highest_bidder_id: user.id,
      })
      .eq("id", body.auction_id)

    return NextResponse.json({ data: bid }, { status: 201 })
  } catch (error) {
    console.error("Bid error:", error)
    return NextResponse.json({ error: "Failed to place bid" }, { status: 500 })
  }
}
