"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BriefcaseBusiness, CheckSquare, CreditCard, DollarSign, LayoutDashboard, Receipt, Users, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: BriefcaseBusiness },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/expenses", label: "Expenses", icon: Receipt },
  { href: "/payments", label: "Payments", icon: CreditCard },
  { href: "/payouts", label: "Payouts", icon: Wallet },
  { href: "/ledger", label: "Partner Ledger", icon: Users },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/exports", label: "Exports", icon: DollarSign }
];

export function Sidebar({ isPartner }: { isPartner: boolean }) {
  const pathname = usePathname();

  return (
    <aside className="w-full rounded-3xl border bg-card/90 p-4 shadow-sm md:w-72">
      <div className="mb-8 p-2">
        <h2 className="text-2xl font-extrabold tracking-tight text-primary">Weblockin</h2>
      </div>
      <nav className="space-y-1">
        {links.map((link) => {
          if (isPartner && !["/dashboard", "/projects", "/tasks", "/payments", "/payouts", "/ledger", "/reports", "/exports"].includes(link.href)) {
            return null;
          }

          const Icon = link.icon;
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
