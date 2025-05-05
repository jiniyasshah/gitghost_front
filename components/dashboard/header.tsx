import Link from "next/link";
import { Github } from "lucide-react";
import { UserNav } from "@/components/dashboard/user-nav";

export function Header() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/30 border-b border-indigo-500/10 shadow-md">
      <div className="container flex h-16 items-center justify-between py-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-xl gradient-text"
        >
          <Github className="h-6 w-6 text-indigo-400" />
          <span>DevFlow</span>
        </Link>
        <UserNav />
      </div>
    </header>
  );
}
