"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Ticket, Coins, GitBranch } from "lucide-react"

type DashboardStats = {
  totalUsers: number
  totalCoupons: number
  activeCoupons: number
  totalCoins: number
  totalTransfers: number
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/admin/stats")
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error("Failed to fetch admin stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading dashboard data...</div>
  }

  if (!stats) {
    return <div className="flex justify-center items-center h-64">Failed to load dashboard data</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-indigo-100">Admin Dashboard</h1>
        <p className="text-indigo-300/70">Overview of your application</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card bg-noise">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-300" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-100">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card className="glass-card bg-noise">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Ticket className="h-5 w-5 text-amber-400" />
              Active Coupons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-100">{stats.activeCoupons}</div>
            <div className="text-xs text-indigo-300/70 mt-1">Out of {stats.totalCoupons} total coupons</div>
          </CardContent>
        </Card>

        <Card className="glass-card bg-noise">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Coins className="h-5 w-5 text-amber-400" />
              Total Coins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-100">{stats.totalCoins}</div>
            <div className="text-xs text-indigo-300/70 mt-1">In circulation</div>
          </CardContent>
        </Card>

        <Card className="glass-card bg-noise">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-indigo-300" />
              Total Transfers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-100">{stats.totalTransfers}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card bg-noise">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-indigo-300/70 text-center py-8">Recent activity will be displayed here</p>
          </CardContent>
        </Card>

        <Card className="glass-card bg-noise">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-indigo-200">Database</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                  Online
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-indigo-200">API</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                  Online
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-indigo-200">GitHub Integration</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                  Online
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
