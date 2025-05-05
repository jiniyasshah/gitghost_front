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
    const limit = 10
    const skip = (page - 1) * limit
    const search = searchParams.get("search") || ""

    // Build query
    let query = {}
    if (search) {
      query = {
        $or: [{ email: { $regex: search, $options: "i" } }, { name: { $regex: search, $options: "i" } }],
      }
    }

    // Get users with pagination
    const users = await db.collection("users").find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray()

    // Get total count for pagination
    const total = await db.collection("users").countDocuments(query)
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      users,
      page,
      totalPages,
      total,
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ message: "Failed to fetch users" }, { status: 500 })
  }
}
