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
    const { userId, isAdmin } = data

    if (!userId) {
      return NextResponse.json({ message: "User ID is required" }, { status: 400 })
    }

    // Update user's admin status
    await db.collection("users").updateOne({ _id: new ObjectId(userId) }, { $set: { isAdmin: isAdmin } })

    return NextResponse.json({
      success: true,
      message: `User admin status updated to ${isAdmin}`,
    })
  } catch (error) {
    console.error("Error updating admin status:", error)
    return NextResponse.json({ message: "Failed to update admin status" }, { status: 500 })
  }
}
