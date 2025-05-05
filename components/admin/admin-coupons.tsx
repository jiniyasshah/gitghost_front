"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Ticket, Plus, Trash2, Copy, Check, X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

type Coupon = {
  _id: string
  code: string
  coins: number
  isRedeemed: boolean
  redeemedBy?: string
  redeemedAt?: string
  createdAt: string
  expiresAt: string
  createdBy: string
}

export function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isCreating, setIsCreating] = useState(false)
  const { toast } = useToast()

  // New coupon form state
  const [newCouponCoins, setNewCouponCoins] = useState(10)
  const [newCouponCount, setNewCouponCount] = useState(1)
  const [generatingCoupons, setGeneratingCoupons] = useState(false)

  useEffect(() => {
    fetchCoupons()
  }, [page])

  async function fetchCoupons() {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/coupons?page=${page}`)
      if (response.ok) {
        const data = await response.json()
        setCoupons(data.coupons)
        setTotalPages(data.totalPages)
      }
    } catch (error) {
      console.error("Failed to fetch coupons:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCoupons = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newCouponCoins <= 0) {
      toast({
        title: "Invalid Input",
        description: "Coin amount must be greater than 0",
        variant: "destructive",
      })
      return
    }

    if (newCouponCount <= 0 || newCouponCount > 100) {
      toast({
        title: "Invalid Input",
        description: "Coupon count must be between 1 and 100",
        variant: "destructive",
      })
      return
    }

    try {
      setGeneratingCoupons(true)
      const response = await fetch("/api/admin/coupons/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          coins: newCouponCoins,
          count: newCouponCount,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Coupons Generated",
          description: `Successfully generated ${data.coupons.length} coupons`,
        })

        // Reset form and refresh coupons
        setNewCouponCoins(10)
        setNewCouponCount(1)
        setIsCreating(false)
        fetchCoupons()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.message || "Failed to generate coupons",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to generate coupons:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setGeneratingCoupons(false)
    }
  }

  const handleDeleteCoupon = async (couponId: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/coupons/${couponId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setCoupons(coupons.filter((coupon) => coupon._id !== couponId))
        toast({
          title: "Coupon Deleted",
          description: "The coupon has been deleted successfully",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to delete coupon",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to delete coupon:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast({
      title: "Copied",
      description: "Coupon code copied to clipboard",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-indigo-100">Coupons</h1>
          <p className="text-indigo-300/70">Manage coupon codes</p>
        </div>
        <Button className="glass-button" onClick={() => setIsCreating(!isCreating)}>
          <span className="button-glow"></span>
          {isCreating ? (
            <span>Cancel</span>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              <span>Generate Coupons</span>
            </>
          )}
        </Button>
      </div>

      {isCreating && (
        <Card className="glass-card bg-noise">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold">Generate New Coupons</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateCoupons} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="coins" className="text-sm font-medium text-indigo-200">
                    Coins Per Coupon
                  </Label>
                  <Input
                    id="coins"
                    type="number"
                    min="1"
                    value={newCouponCoins}
                    onChange={(e) => setNewCouponCoins(Number.parseInt(e.target.value))}
                    className="glass-input"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="count" className="text-sm font-medium text-indigo-200">
                    Number of Coupons
                  </Label>
                  <Input
                    id="count"
                    type="number"
                    min="1"
                    max="100"
                    value={newCouponCount}
                    onChange={(e) => setNewCouponCount(Number.parseInt(e.target.value))}
                    className="glass-input"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="glass-button w-full" disabled={generatingCoupons}>
                <span className="button-glow"></span>
                {generatingCoupons ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Ticket className="mr-2 h-4 w-4" />
                    <span>Generate Coupons</span>
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="glass-card bg-noise">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold">Coupon Management</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-indigo-300/70">Loading coupons...</div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-8 text-indigo-300/70">No coupons found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-indigo-500/20">
                    <th className="text-left py-2 px-4 text-indigo-200 font-medium">Code</th>
                    <th className="text-center py-2 px-4 text-indigo-200 font-medium">Coins</th>
                    <th className="text-center py-2 px-4 text-indigo-200 font-medium">Status</th>
                    <th className="text-left py-2 px-4 text-indigo-200 font-medium">Created</th>
                    <th className="text-left py-2 px-4 text-indigo-200 font-medium">Expires</th>
                    <th className="text-center py-2 px-4 text-indigo-200 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((coupon) => (
                    <tr key={coupon._id} className="border-b border-indigo-500/10 hover:bg-indigo-500/5">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Ticket className="h-4 w-4 text-amber-400" />
                          <code className="text-indigo-200 font-mono">{coupon.code}</code>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center text-indigo-200">{coupon.coins}</td>
                      <td className="py-3 px-4 text-center">
                        {coupon.isRedeemed ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-300">
                            <X className="h-3 w-3 mr-1" />
                            Redeemed
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300">
                            <Check className="h-3 w-3 mr-1" />
                            Active
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-indigo-300 text-sm">
                        {format(new Date(coupon.createdAt), "MMM d, yyyy")}
                      </td>
                      <td className="py-3 px-4 text-indigo-300 text-sm">
                        {format(new Date(coupon.expiresAt), "MMM d, yyyy")}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            className="h-7 w-7 p-0 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200"
                            onClick={() => handleCopyCode(coupon.code)}
                            title="Copy code"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          {!coupon.isRedeemed && (
                            <Button
                              size="sm"
                              className="h-7 w-7 p-0 bg-red-500/20 hover:bg-red-500/30 text-red-300"
                              onClick={() => handleDeleteCoupon(coupon._id)}
                              title="Delete coupon"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-indigo-300/70">
              Page {page} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-8 px-2 border-indigo-500/20 hover:bg-indigo-500/10"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="h-8 px-2 border-indigo-500/20 hover:bg-indigo-500/10"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
