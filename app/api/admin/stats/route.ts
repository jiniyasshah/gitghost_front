import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Check if user is an admin
    const client = await clientPromise
    const db = client.db("devflow")
    const user = await db.collection("users").findOne({ email: session.user.email })

    if (!user?.isAdmin) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    // Get stats
    const totalUsers = await db.collection("users").countDocuments()
    const totalCoupons = await db.collection("coupons").countDocuments()
    const activeCoupons = await db.collection("coupons").countDocuments({ isRedeemed: false })

    // Calculate total coins in circulation
    const coinsAggregation = await db
      .collection("users")
      .aggregate([{ $group: { _id: null, total: { $sum: "$coins" } } }])
      .toArray()
    const totalCoins = coinsAggregation.length > 0 ? coinsAggregation[0].total : 0

    // Get total transfers
    const totalTransfers = await db.collection("transfers").countDocuments()

    return NextResponse.json({
      totalUsers,
      totalCoupons,
      activeCoupons,
      totalCoins,
      totalTransfers,
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json({ message: "Failed to fetch stats" }, { status: 500 })
  }
}
