import type { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import clientPromise from "@/lib/mongodb";

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      authorization: {
        params: {
          scope: "read:user user:email repo",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client, like an access_token from a provider
      session.accessToken = token.accessToken as string;
      return session;
    },
    async signIn({ user }) {
      try {
        console.log("SignIn callback triggered for user:", user.email);

        // Connect to MongoDB
        const client = await clientPromise;
        const db = client.db("devflow");

        // Check if this is the user's first login
        const existingUser = await db
          .collection("users")
          .findOne({ email: user.email });

        if (!existingUser) {
          console.log("First-time login detected for:", user.email);

          // This is a first-time login - create user and award 10 coins
          await db.collection("users").insertOne({
            email: user.email,
            name: user.name,
            image: user.image,
            coins: 10, // Award 10 coins for first login
            createdAt: new Date(),
          });

          // Record the coin transaction
          await db.collection("coinTransactions").insertOne({
            userId: user.email,
            amount: 10,
            reason: "Welcome bonus - First login reward",
            timestamp: new Date(),
          });

          console.log("Awarded 10 coins to new user:", user.email);
        } else {
          console.log("Returning user detected:", user.email);
        }

        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        // Still allow sign in even if the coin reward fails
        return true;
      }
    },
  },
  pages: {
    signIn: "/api/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
  debug: process.env.NODE_ENV === "development",
};
