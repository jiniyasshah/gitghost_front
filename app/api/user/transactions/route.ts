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

    const client = await clientPromise
    const db = client.db("devflow")

    // Get user's transaction history
    const transactions = await db
      .collection("coinTransactions")
      .find({ userId: session.user.email })
      .sort({ timestamp: -1 })
      .limit(50)
      .toArray()

    return NextResponse.json({ transactions })
  } catch (error) {
    console.error("Error fetching transaction history:", error)
    return NextResponse.json({ message: "Failed to fetch transaction history" }, { status: 500 })
  }
}
