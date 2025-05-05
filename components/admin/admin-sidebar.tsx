"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, Ticket, History, LogOut, ChevronRight } from "lucide-react"
import { signOut } from "next-auth/react"

export function AdminSidebar() {
  const pathname = usePathname()

  const navItems = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      name: "Users",
      href: "/admin/users",
      icon: Users,
    },
    {
      name: "Coupons",
      href: "/admin/coupons",
      icon: Ticket,
    },
    {
      name: "Transactions",
      href: "/admin/transactions",
      icon: History,
    },
  ]

  return (
    <div className="w-64 bg-indigo-900/50 border-r border-indigo-500/20 h-screen flex flex-col">
      <div className="p-4 border-b border-indigo-500/20">
        <h1 className="text-xl font-bold text-indigo-100">DevFlow Admin</h1>
        <p className="text-xs text-indigo-300/70">Management Dashboard</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
              pathname === item.href
                ? "bg-indigo-500/20 text-indigo-100"
                : "text-indigo-300/70 hover:text-indigo-100 hover:bg-indigo-500/10",
            )}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.name}</span>
            {pathname === item.href && <ChevronRight className="h-4 w-4 ml-auto" />}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-indigo-500/20">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-indigo-300/70 hover:text-indigo-100 hover:bg-indigo-500/10 mb-2"
        >
          <LayoutDashboard className="h-4 w-4" />
          <span>Back to App</span>
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-indigo-300/70 hover:text-indigo-100 hover:bg-indigo-500/10 w-full text-left"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  )
}
