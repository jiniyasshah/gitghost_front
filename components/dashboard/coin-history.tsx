"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { format } from "date-fns"
import { Coins, ArrowUp, ArrowDown, Ticket } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

type Transaction = {
  _id: string
  userId: string
  amount: number
  reason: string
  timestamp: string
  couponId?: string
}

export function CoinHistory() {
  const { data: session } = useSession()
  const [coins, setCoins] = useState<number | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      if (!session?.user?.email) return

      try {
        setLoading(true)

        // Fetch user coins
        const coinsResponse = await fetch("/api/user/coins")
        if (coinsResponse.ok) {
          const coinsData = await coinsResponse.json()
          setCoins(coinsData.coins)
        }

        // Fetch transaction history
        const transactionsResponse = await fetch("/api/user/transactions")
        if (transactionsResponse.ok) {
          const transactionsData = await transactionsResponse.json()
          setTransactions(transactionsData.transactions)
        }
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [session?.user?.email])

  return (
    <div className="space-y-6">
      <Card className="glass-card bg-noise">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Coins className="h-5 w-5 text-amber-400" />
            Coin Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-4xl font-bold text-indigo-100">
              {loading ? "..." : (coins ?? 0)}
              <span className="text-sm text-indigo-300 ml-2">coins</span>
            </div>
            <Link href="/dashboard/coins/redeem">
              <Button className="glass-button">
                <span className="button-glow"></span>
                <span className="flex items-center">
                  <Ticket className="mr-1 h-4 w-4" />
                  Redeem Coupon
                </span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card bg-noise">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold">Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-indigo-300/70">Loading transactions...</div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-indigo-300/70">No transactions yet</div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div
                  key={transaction._id}
                  className="flex items-center justify-between p-3 rounded-md border border-indigo-500/10 bg-indigo-500/5"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${transaction.amount > 0 ? "bg-green-500/10" : "bg-red-500/10"}`}>
                      {transaction.amount > 0 ? (
                        <ArrowUp className="h-4 w-4 text-green-400" />
                      ) : (
                        <ArrowDown className="h-4 w-4 text-red-400" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-indigo-200">
                        {transaction.reason || (transaction.amount > 0 ? "Added coins" : "Spent coins")}
                      </div>
                      <div className="text-xs text-indigo-300/70">
                        {format(new Date(transaction.timestamp), "PPpp")}
                      </div>
                    </div>
                  </div>
                  <div className={`text-sm font-medium ${transaction.amount > 0 ? "text-green-400" : "text-red-400"}`}>
                    {transaction.amount > 0 ? "+" : ""}
                    {transaction.amount} coins
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
