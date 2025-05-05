import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { CoinPurchase } from "@/components/dashboard/coin-purchase"

export default async function PurchaseCoinsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/api/auth/signin")
  }

  return (
    <DashboardShell>
      <div className="max-w-3xl mx-auto w-full">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold gradient-text mb-3">Purchase Coins</h1>
          <p className="text-indigo-200/70 max-w-lg mx-auto">
            Buy coins to unlock premium features like custom dates and contributors
          </p>
        </div>
        <CoinPurchase />
      </div>
    </DashboardShell>
  )
}
