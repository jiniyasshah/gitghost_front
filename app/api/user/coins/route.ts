import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

// Get user's current coin balance
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    console.log("Fetching coins for user:", session.user.email);

    const client = await clientPromise;
    const db = client.db("devflow");

    // Find user in the database
    const user = await db
      .collection("users")
      .findOne({ email: session.user.email });

    // If user doesn't exist, create them with default coins
    if (!user) {
      console.log(
        "User not found in database, creating new user with 10 coins"
      );

      await db.collection("users").insertOne({
        email: session.user.email,
        name: session.user.name,
        coins: 10, // Default starting coins
        createdAt: new Date(),
      });

      return NextResponse.json({ coins: 10 });
    }

    console.log("User found with coins:", user.coins || 0);
    return NextResponse.json({ coins: user.coins || 0 });
  } catch (error) {
    console.error("Error fetching user coins:", error);
    return NextResponse.json(
      { message: "Failed to fetch user coins" },
      { status: 500 }
    );
  }
}
