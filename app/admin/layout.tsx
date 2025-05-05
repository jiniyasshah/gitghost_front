import type React from "react"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import clientPromise from "@/lib/mongodb"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/api/auth/signin")
  }

  // Check if user is an admin
  const client = await clientPromise
  const db = client.db("devflow")
  const user = await db.collection("users").findOne({ email: session.user.email })

  if (!user?.isAdmin) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 p-6 md:p-8 overflow-auto">{children}</div>
    </div>
  )
}
