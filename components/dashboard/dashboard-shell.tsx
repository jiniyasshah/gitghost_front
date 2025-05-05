import type React from "react";
import { WelcomeBanner } from "@/components/welcome-banner";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="flex-1 flex flex-col">
      <main className="flex w-full flex-col overflow-hidden p-4 sm:p-6 md:p-8">
        <WelcomeBanner />
        {children}
      </main>
    </div>
  );
}
