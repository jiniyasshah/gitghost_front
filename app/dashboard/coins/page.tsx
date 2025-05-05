import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { CoinHistory } from "@/components/dashboard/coin-history"

export default async function CoinsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/api/auth/signin")
  }

  return (
    <DashboardShell>
      <div className="max-w-3xl mx-auto w-full">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold gradient-text mb-3">Your Coins</h1>
          <p className="text-indigo-200/70 max-w-lg mx-auto">View your coin balance and transaction history</p>
        </div>
        <CoinHistory />
      </div>
    </DashboardShell>
  )
}
