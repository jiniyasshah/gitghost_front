"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Coins, Search, ChevronLeft, ChevronRight, Check, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type User = {
  _id: string
  email: string
  name: string
  image: string
  coins: number
  isAdmin: boolean
  createdAt: string
}

export function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const { toast } = useToast()

  useEffect(() => {
    fetchUsers()
  }, [page])

  async function fetchUsers() {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/users?page=${page}&search=${searchTerm}`)
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
        setTotalPages(data.totalPages)
      }
    } catch (error) {
      console.error("Failed to fetch users:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1) // Reset to first page on new search
    fetchUsers()
  }

  const handleAddCoins = async (userId: string, amount: number) => {
    try {
      const response = await fetch("/api/admin/users/add-coins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          amount,
        }),
      })

      if (response.ok) {
        // Update the user in the local state
        setUsers(users.map((user) => (user._id === userId ? { ...user, coins: user.coins + amount } : user)))

        toast({
          title: "Coins Added",
          description: `Added ${amount} coins to user's account`,
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to add coins",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to add coins:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch("/api/admin/users/toggle-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          isAdmin: !currentStatus,
        }),
      })

      if (response.ok) {
        // Update the user in the local state
        setUsers(users.map((user) => (user._id === userId ? { ...user, isAdmin: !currentStatus } : user)))

        toast({
          title: "Admin Status Updated",
          description: `User is now ${!currentStatus ? "an admin" : "no longer an admin"}`,
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to update admin status",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to toggle admin status:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-indigo-100">Users</h1>
          <p className="text-indigo-300/70">Manage user accounts</p>
        </div>
      </div>

      <Card className="glass-card bg-noise">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold">User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2 mb-6">
            <Input
              placeholder="Search by email or name"
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
            <div className="text-center py-8 text-indigo-300/70">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-indigo-300/70">No users found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-indigo-500/20">
                    <th className="text-left py-2 px-4 text-indigo-200 font-medium">User</th>
                    <th className="text-left py-2 px-4 text-indigo-200 font-medium">Email</th>
                    <th className="text-center py-2 px-4 text-indigo-200 font-medium">Coins</th>
                    <th className="text-center py-2 px-4 text-indigo-200 font-medium">Admin</th>
                    <th className="text-center py-2 px-4 text-indigo-200 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className="border-b border-indigo-500/10 hover:bg-indigo-500/5">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {user.image ? (
                            <img
                              src={user.image || "/placeholder.svg"}
                              alt={user.name || "User"}
                              className="h-8 w-8 rounded-full"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-200">
                              {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
                            </div>
                          )}
                          <span className="text-indigo-200">{user.name || "No name"}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-indigo-300">{user.email}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Coins className="h-4 w-4 text-amber-400" />
                          <span className="text-indigo-200">{user.coins}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {user.isAdmin ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300">
                            <Check className="h-3 w-3 mr-1" />
                            Yes
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-300">
                            <X className="h-3 w-3 mr-1" />
                            No
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            className="h-7 px-2 text-xs bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200"
                            onClick={() => handleAddCoins(user._id, 10)}
                          >
                            <Coins className="h-3 w-3 mr-1 text-amber-400" />
                            Add 10
                          </Button>
                          <Button
                            size="sm"
                            className="h-7 px-2 text-xs bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200"
                            onClick={() => toggleAdminStatus(user._id, user.isAdmin)}
                          >
                            {user.isAdmin ? "Remove Admin" : "Make Admin"}
                          </Button>
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
