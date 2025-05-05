"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Coins, Ticket, Check, AlertCircle, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { useCoinsStore } from "@/lib/stores/coins-store"

export function CouponRedemption() {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const { incrementCoins } = useCoinsStore()
  const [couponCode, setCouponCode] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleRedeemCoupon = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!couponCode.trim()) {
      setError("Please enter a coupon code")
      return
    }

    if (!session?.user?.email) {
      toast({
        title: "Error",
        description: "You must be logged in to redeem coupons",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("/api/coupons/redeem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: couponCode.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || "Failed to redeem coupon")
        return
      }

      // Update local coin count
      incrementCoins(data.coinsAdded)

      // Show success message
      setSuccess(`Successfully redeemed coupon for ${data.coinsAdded} coins!`)
      setCouponCode("")

      // Show toast notification
      toast({
        title: "Coupon Redeemed!",
        description: `You've added ${data.coinsAdded} coins to your account.`,
      })

      // Redirect to coins page after a short delay
      setTimeout(() => {
        router.push("/dashboard/coins")
        router.refresh()
      }, 2000)
    } catch (error) {
      console.error("Coupon redemption error:", error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="glass-card bg-noise">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Ticket className="h-5 w-5 text-amber-400" />
            Redeem Coupon
          </CardTitle>
          <CardDescription className="text-indigo-200/70">
            Enter your coupon code below to add coins to your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleRedeemCoupon}>
          <CardContent className="space-y-4 pt-4">
            {error && (
              <Alert className="bg-red-500/10 border-red-500/20 text-red-200">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-emerald-500/10 border-emerald-500/20 text-emerald-200">
                <Check className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="coupon-code" className="text-sm font-medium text-indigo-200">
                Coupon Code
              </Label>
              <div className="relative">
                <Ticket className="absolute left-3 top-2.5 h-5 w-5 text-indigo-300" />
                <Input
                  id="coupon-code"
                  placeholder="Enter your coupon code"
                  className="glass-input pl-10"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  disabled={isProcessing}
                />
              </div>
              <p className="text-xs text-indigo-300/70">
                Coupon codes can be purchased from authorized resellers or received as rewards
              </p>
            </div>
          </CardContent>
          <CardFooter className="border-t border-indigo-500/10 bg-indigo-500/5 py-4">
            <Button type="submit" className="glass-button w-full group" disabled={isProcessing || !couponCode.trim()}>
              <span className="button-glow"></span>
              <div className="flex items-center justify-center">
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Coins className="mr-2 h-4 w-4 text-amber-400" />
                    <span>Redeem Coupon</span>
                  </>
                )}
              </div>
            </Button>
          </CardFooter>
        </form>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-indigo-100">How to Get Coupons</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="glass-card bg-noise">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold">Authorized Resellers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-indigo-200/70">
                Purchase coupon codes from our authorized resellers. Contact our support team for a list of official
                resellers in your region.
              </p>
            </CardContent>
          </Card>
          <Card className="glass-card bg-noise">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold">Special Events</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-indigo-200/70">
                Participate in our special events, contests, and promotions to win coupon codes. Follow our social media
                channels for announcements.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
