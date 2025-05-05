import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/mongodb"

export async function GET(request: Request) {
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

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = 20
    const skip = (page - 1) * limit
    const search = searchParams.get("search") || ""

    // Build query
    let query = {}
    if (search) {
      query = {
        $or: [{ userId: { $regex: search, $options: "i" } }, { reason: { $regex: search, $options: "i" } }],
      }
    }

    // Get transactions with pagination
    const transactions = await db
      .collection("coinTransactions")
      .find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    // Get total count for pagination
    const total = await db.collection("coinTransactions").countDocuments(query)
    const totalPages = Math.ceil(total / limit)

    // Fetch user details for each transaction
    const transactionsWithUserDetails = await Promise.all(
      transactions.map(async (transaction) => {
        const user = await db.collection("users").findOne({ email: transaction.userId })
        return {
          ...transaction,
          userName: user?.name || null,
          userEmail: transaction.userId,
        }
      }),
    )

    return NextResponse.json({
      transactions: transactionsWithUserDetails,
      page,
      totalPages,
      total,
    })
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json({ message: "Failed to fetch transactions" }, { status: 500 })
  }
}
