"use client"

import { useEffect } from "react"
import { Coins } from "lucide-react"
import { useSession } from "next-auth/react"
import { useCoinsStore } from "@/lib/stores/coins-store"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function UserCoins() {
  const { data: session } = useSession()
  const { coins, setCoins, loading, setLoading } = useCoinsStore()

  useEffect(() => {
    async function fetchUserCoins() {
      if (!session?.user?.email) return

      try {
        setLoading(true)
        const response = await fetch("/api/user/coins")
        if (response.ok) {
          const data = await response.json()
          setCoins(data.coins)
        }
      } catch (error) {
        console.error("Failed to fetch user coins:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserCoins()
  }, [session?.user?.email, setCoins, setLoading])

  if (loading) {
    return (
      <div className="flex items-center gap-1.5 text-indigo-300/70">
        <Coins className="h-4 w-4" />
        <span className="text-sm">Loading...</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5 text-indigo-300">
        <Coins className="h-4 w-4 text-amber-400" />
        <span className="text-sm font-medium">{coins ?? 0} coins</span>
      </div>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href="/dashboard/coins/redeem">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-indigo-300 hover:text-indigo-100 hover:bg-indigo-500/20"
              >
                + Redeem
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent>
            <p>Redeem a coupon code</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
