import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

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
    const { userId, amount } = data

    if (!userId || !amount || amount <= 0) {
      return NextResponse.json({ message: "Invalid request data" }, { status: 400 })
    }

    // Find the target user
    const targetUser = await db.collection("users").findOne({ _id: new ObjectId(userId) })

    if (!targetUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Add coins to user's account
    await db.collection("users").updateOne({ _id: new ObjectId(userId) }, { $inc: { coins: amount } })

    // Record the transaction
    await db.collection("coinTransactions").insertOne({
      userId: targetUser.email,
      amount: amount,
      reason: `Admin added ${amount} coins`,
      adminId: session.user.email,
      timestamp: new Date(),
    })

    return NextResponse.json({
      success: true,
      message: `Added ${amount} coins to user's account`,
    })
  } catch (error) {
    console.error("Error adding coins:", error)
    return NextResponse.json({ message: "Failed to add coins" }, { status: 500 })
  }
}
