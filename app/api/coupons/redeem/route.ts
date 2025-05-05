import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/mongodb"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    const { code } = data

    if (!code) {
      return NextResponse.json({ message: "Coupon code is required" }, { status: 400 })
    }

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db("devflow")

    // Find the coupon in the database
    const coupon = await db.collection("coupons").findOne({
      code: code,
      isRedeemed: false,
      expiresAt: { $gt: new Date() },
    })

    if (!coupon) {
      return NextResponse.json({ message: "Invalid or expired coupon code" }, { status: 400 })
    }

    // Mark the coupon as redeemed
    await db.collection("coupons").updateOne(
      { _id: coupon._id },
      {
        $set: {
          isRedeemed: true,
          redeemedBy: session.user.email,
          redeemedAt: new Date(),
        },
      },
    )

    // Add coins to user's account
    await db.collection("users").updateOne({ email: session.user.email }, { $inc: { coins: coupon.coins } })

    // Record the transaction
    await db.collection("coinTransactions").insertOne({
      userId: session.user.email,
      amount: coupon.coins,
      reason: `Redeemed coupon: ${code}`,
      couponId: coupon._id,
      timestamp: new Date(),
    })

    return NextResponse.json({
      success: true,
      message: "Coupon redeemed successfully",
      coinsAdded: coupon.coins,
    })
  } catch (error) {
    console.error("Error redeeming coupon:", error)
    return NextResponse.json({ message: "Failed to redeem coupon" }, { status: 500 })
  }
}
