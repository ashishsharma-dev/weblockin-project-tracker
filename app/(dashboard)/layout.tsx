import { auth } from "@/auth";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row">
        <Sidebar isPartner={session.user.role === "PARTNER"} />
        <div className="flex-1 space-y-6">
          <Topbar />
          {children}
        </div>
      </div>
    </div>
  );
}
