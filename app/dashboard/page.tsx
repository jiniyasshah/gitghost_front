import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { RepoForm } from "@/components/dashboard/repo-form";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin");
  }

  return (
    <DashboardShell>
      <div className="max-w-3xl mx-auto w-full">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold gradient-text mb-3">
            Repository Transfer
          </h1>
          <p className="text-indigo-200/70 max-w-lg mx-auto">
            Configure your repository transfer settings below
          </p>
        </div>
        <RepoForm />
      </div>
    </DashboardShell>
  );
}
