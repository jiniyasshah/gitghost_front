import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Check if user is an admin
    const client = await clientPromise
    const db = client.db("devflow")
    const adminUser = await db.collection("users").findOne({ email: session.user.email })

    if (!adminUser?.isAdmin) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const couponId = params.id

    // Delete the coupon
    const result = await db.collection("coupons").deleteOne({
      _id: new ObjectId(couponId),
      isRedeemed: false, // Only allow deletion of unredeemed coupons
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: "Coupon not found or already redeemed" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Coupon deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting coupon:", error)
    return NextResponse.json({ message: "Failed to delete coupon" }, { status: 500 })
  }
}
