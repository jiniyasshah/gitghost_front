"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { ArrowUp, ArrowDown, Search, ChevronLeft, ChevronRight } from "lucide-react"

type Transaction = {
  _id: string
  userId: string
  userEmail?: string
  userName?: string
  amount: number
  reason: string
  timestamp: string
  couponId?: string
}

export function AdminTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchTransactions()
  }, [page])

  async function fetchTransactions() {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/transactions?page=${page}&search=${searchTerm}`)
      if (response.ok) {
        const data = await response.json()
        setTransactions(data.transactions)
        setTotalPages(data.totalPages)
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1) // Reset to first page on new search
    fetchTransactions()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-indigo-100">Transactions</h1>
        <p className="text-indigo-300/70">View all coin transactions</p>
      </div>

      <Card className="glass-card bg-noise">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold">Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2 mb-6">
            <Input
              placeholder="Search by user email or reason"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="glass-input"
            />
            <Button type="submit" className="glass-button">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </form>

          {loading ? (
            <div className="text-center py-8 text-indigo-300/70">Loading transactions...</div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-indigo-300/70">No transactions found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-indigo-500/20">
                    <th className="text-left py-2 px-4 text-indigo-200 font-medium">User</th>
                    <th className="text-left py-2 px-4 text-indigo-200 font-medium">Reason</th>
                    <th className="text-center py-2 px-4 text-indigo-200 font-medium">Amount</th>
                    <th className="text-left py-2 px-4 text-indigo-200 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction._id} className="border-b border-indigo-500/10 hover:bg-indigo-500/5">
                      <td className="py-3 px-4 text-indigo-200">
                        {transaction.userName || transaction.userEmail || transaction.userId}
                      </td>
                      <td className="py-3 px-4 text-indigo-300">{transaction.reason}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center">
                          <span
                            className={`flex items-center ${
                              transaction.amount > 0 ? "text-green-400" : "text-red-400"
                            }`}
                          >
                            {transaction.amount > 0 ? (
                              <ArrowUp className="h-4 w-4 mr-1" />
                            ) : (
                              <ArrowDown className="h-4 w-4 mr-1" />
                            )}
                            {transaction.amount > 0 ? "+" : ""}
                            {transaction.amount} coins
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-indigo-300 text-sm">
                        {format(new Date(transaction.timestamp), "PPp")}
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
