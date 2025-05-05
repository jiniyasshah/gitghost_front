import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/mongodb"
import { randomBytes } from "crypto"

export async function POST(request: Request) {
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

    const data = await request.json()
    const { coins, count } = data

    if (!coins || coins <= 0) {
      return NextResponse.json({ message: "Invalid coin amount" }, { status: 400 })
    }

    if (!count || count <= 0 || count > 100) {
      return NextResponse.json({ message: "Invalid coupon count" }, { status: 400 })
    }

    // Generate coupons
    const coupons = []
    for (let i = 0; i < count; i++) {
      const code = generateCouponCode()
      const expiresAt = new Date()
      expiresAt.setFullYear(expiresAt.getFullYear() + 1) // Expires in 1 year

      coupons.push({
        code,
        coins,
        isRedeemed: false,
        createdAt: new Date(),
        expiresAt,
        createdBy: session.user.email,
      })
    }

    // Insert coupons into database
    await db.collection("coupons").insertMany(coupons)

    return NextResponse.json({
      success: true,
      message: `Generated ${count} coupons`,
      coupons,
    })
  } catch (error) {
    console.error("Error generating coupons:", error)
    return NextResponse.json({ message: "Failed to generate coupons" }, { status: 500 })
  }
}

// Helper function to generate a random coupon code
function generateCouponCode() {
  // Format: DEV-XXXX-XXXX-XXXX (where X is alphanumeric)
  const bytes = randomBytes(9) // 9 bytes = 18 hex chars
  const hex = bytes.toString("hex").toUpperCase()

  // Format as DEV-XXXX-XXXX-XXXX
  return `DEV-${hex.slice(0, 4)}-${hex.slice(4, 8)}-${hex.slice(8, 12)}`
}
