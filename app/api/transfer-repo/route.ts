import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    if (!data.source_repo || !data.dest_repo) {
      return NextResponse.json(
        { message: "Source and destination repositories are required" },
        { status: 400 }
      );
    }

    // Validate that the destination repo belongs to the current user
    try {
      const destRepoUrl = new URL(data.dest_repo);
      if (destRepoUrl.hostname === "github.com") {
        const pathParts = destRepoUrl.pathname.split("/");
        if (pathParts.length >= 3) {
          const repoOwner = pathParts[1].toLowerCase();

          // Get user's GitHub username from session or profile
          let userGithubUsername = "";

          // If we have the username directly in the session
          if (session.user?.name) {
            userGithubUsername = session.user.name.toLowerCase();
          } else {
            // Fetch the user's GitHub profile to get their username
            try {
              const response = await fetch("https://api.github.com/user", {
                headers: {
                  Authorization: `token ${session.accessToken}`,
                },
              });

              if (response.ok) {
                const profile = await response.json();
                userGithubUsername = profile.login.toLowerCase();
              }
            } catch (error) {
              console.error("Error fetching GitHub profile:", error);
            }
          }

          // If we have the username and it doesn't match the repo owner
          if (userGithubUsername && repoOwner !== userGithubUsername) {
            return NextResponse.json(
              {
                message:
                  "Destination repository must belong to your GitHub account",
                details:
                  "You can only transfer repositories to your own GitHub account",
              },
              { status: 400 }
            );
          }
        }
      }
    } catch (error) {
      console.error("Error validating repository URL:", error);
      return NextResponse.json(
        { message: "Invalid destination repository URL" },
        { status: 400 }
      );
    }

    // Calculate coin cost
    let coinCost = 0;
    const features = [];

    // Cost for setting custom dates (if not keeping original dates)
    if (!data.keep_original_dates && data.start_date) {
      coinCost += 2;
      features.push("custom dates");
    }

    // Cost for adding contributors (2 coins per contributor)
    const contributorCount = data.contributors
      ? data.contributors.filter((c: string) => c.trim() !== "").length
      : 0;

    if (contributorCount > 0) {
      const contributorCost = contributorCount * 2;
      coinCost += contributorCost;
      features.push(
        `${contributorCount} custom contributor${
          contributorCount > 1 ? "s" : ""
        } (${contributorCost} coins)`
      );
    }

    // Check if user has enough coins
    if (coinCost > 0) {
      const client = await clientPromise;
      const db = client.db("devflow");

      const user = await db.collection("users").findOne({
        email: session.user.email,
      });

      const userCoins = user?.coins || 0;

      if (userCoins < coinCost) {
        return NextResponse.json(
          {
            message: `Not enough coins. You need ${coinCost} coins for this operation.`,
            requiredCoins: coinCost,
            userCoins: userCoins,
          },
          { status: 402 }
        );
      }

      // Deduct coins from user
      await db
        .collection("users")
        .updateOne(
          { email: session.user.email },
          { $inc: { coins: -coinCost } }
        );

      // Log the transaction
      await db.collection("coinTransactions").insertOne({
        userId: session.user.email,
        amount: -coinCost,
        reason: `Repository transfer with premium features: ${features.join(
          ", "
        )}`,
        timestamp: new Date(),
      });

      console.log(
        `Deducted ${coinCost} coins from user ${
          session.user.email
        } for features: ${features.join(", ")}`
      );
    }

    let authenticatedDestRepo = data.dest_repo;
    let username = "";
    if (session.accessToken) {
      const destRepoUrl = new URL(data.dest_repo);
      const pathParts = destRepoUrl.pathname.split("/");

      if (destRepoUrl.hostname === "github.com" && pathParts.length >= 3) {
        username = pathParts[1];
        const repoName = pathParts[2].endsWith(".git")
          ? pathParts[2]
          : `${pathParts[2]}.git`;

        authenticatedDestRepo = `https://${username}:${session.accessToken}@github.com/${username}/${repoName}`;
      }
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("devflow");

    // Store the transfer request in MongoDB first
    const result = await db.collection("transfers").insertOne({
      userId: session.user.email,
      sourceRepo: data.source_repo,
      destRepo: authenticatedDestRepo,
      originalDestRepo: data.dest_repo,
      startDate: data.start_date,
      endDate: data.end_date,
      keepOriginalDates: data.keep_original_dates || false,
      contributors: data.contributors,
      coinCost,
      features,
      status: "pending",
      createdAt: new Date(),
    });

    // Call Flask API to trigger rewrite process
    const response = await fetch(
      "https://gitghost-imhx6.ondigitalocean.app/rewrite-repo",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transferId: result.insertedId, // Pass ID so Flask can update the same record later
          source_repo: data.source_repo,
          dest_repo: authenticatedDestRepo,
          originalDestRepo: data.dest_repo,
          start_date: data.start_date,
          end_date: data.end_date,
          keep_original_dates: data.keep_original_dates || false,
          contributors: data.contributors,
          userId: session.user.email,
          userName: username,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // If the API call fails, refund the coins
      if (coinCost > 0) {
        await db
          .collection("users")
          .updateOne(
            { email: session.user.email },
            { $inc: { coins: coinCost } }
          );

        // Log the refund transaction
        await db.collection("coinTransactions").insertOne({
          userId: session.user.email,
          amount: coinCost,
          reason: `Refund for failed repository transfer`,
          timestamp: new Date(),
        });

        console.log(
          `Refunded ${coinCost} coins to user ${session.user.email} due to failed transfer`
        );
      }

      return NextResponse.json(
        { message: "Failed to trigger rewrite process", error: errorData },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Repository transfer request submitted successfully",
      id: result.insertedId,
      coinsSpent: coinCost,
    });
  } catch (error) {
    console.error("Error processing transfer request:", error);
    return NextResponse.json(
      { message: "Failed to process transfer request" },
      { status: 500 }
    );
  }
}
