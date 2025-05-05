import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { CouponRedemption } from "@/components/dashboard/coupon-redemption"

export default async function RedeemCoinsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/api/auth/signin")
  }

  return (
    <DashboardShell>
      <div className="max-w-3xl mx-auto w-full">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold gradient-text mb-3">Redeem Coupon</h1>
          <p className="text-indigo-200/70 max-w-lg mx-auto">Enter your coupon code to add coins to your account</p>
        </div>
        <CouponRedemption />
      </div>
    </DashboardShell>
  )
}
