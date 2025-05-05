"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Home, GitBranch, Coins, Ticket } from "lucide-react"

export function Nav() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6 mx-6">
      <Link
        href="/dashboard"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/dashboard" ? "text-indigo-100" : "text-indigo-300/70",
        )}
      >
        <Button variant="ghost" className="w-full justify-start px-2 gap-2 hover:bg-indigo-500/10">
          <Home className="h-4 w-4" />
          <span>Dashboard</span>
        </Button>
      </Link>
      <Link
        href="/dashboard/transfer"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/dashboard/transfer" ? "text-indigo-100" : "text-indigo-300/70",
        )}
      >
        <Button variant="ghost" className="w-full justify-start px-2 gap-2 hover:bg-indigo-500/10">
          <GitBranch className="h-4 w-4" />
          <span>Transfer</span>
        </Button>
      </Link>
      <Link
        href="/dashboard/coins"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/dashboard/coins" ? "text-indigo-100" : "text-indigo-300/70",
        )}
      >
        <Button variant="ghost" className="w-full justify-start px-2 gap-2 hover:bg-indigo-500/10">
          <Coins className="h-4 w-4" />
          <span>Coins</span>
        </Button>
      </Link>
      <Link
        href="/dashboard/coins/redeem"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/dashboard/coins/redeem" ? "text-indigo-100" : "text-indigo-300/70",
        )}
      >
        <Button variant="ghost" className="w-full justify-start px-2 gap-2 hover:bg-indigo-500/10">
          <Ticket className="h-4 w-4" />
          <span>Redeem</span>
        </Button>
      </Link>
    </nav>
  )
}
