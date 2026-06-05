import { PageHeader } from "@/components/page-header";
import { DataTableCard } from "@/components/data-table-card";
import { getPartnerLedger } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

export default async function LedgerPage() {
  const ledger = await getPartnerLedger();

  return (
    <div className="space-y-6">
      <PageHeader title="Partner Ledger" description="A single source of truth for earnings, payouts, pending balances, and contribution history." />
      <div className="grid gap-4 xl:grid-cols-2">
        {ledger.map((entry) => (
          <DataTableCard key={entry.id} title={`${entry.code} · ${entry.name}`}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-muted/60 p-4">
                <p className="text-sm text-muted-foreground">Total earnings</p>
                <p className="mt-2 text-xl font-semibold">{formatCurrency(entry.totalEarnings)}</p>
              </div>
              <div className="rounded-2xl bg-muted/60 p-4">
                <p className="text-sm text-muted-foreground">Pending payout</p>
                <p className="mt-2 text-xl font-semibold">{formatCurrency(entry.pendingPayout)}</p>
              </div>
              <div className="rounded-2xl bg-muted/60 p-4">
                <p className="text-sm text-muted-foreground">Total paid</p>
                <p className="mt-2 text-xl font-semibold">{formatCurrency(entry.totalPaid)}</p>
              </div>
              <div className="rounded-2xl bg-muted/60 p-4">
                <p className="text-sm text-muted-foreground">Projects involved</p>
                <p className="mt-2 text-xl font-semibold">{entry.projectsInvolved}</p>
              </div>
            </div>
            <div className="mt-6">
              <p className="mb-3 text-sm font-medium">Monthly earnings</p>
              <div className="grid gap-3 md:grid-cols-2">
                {Object.entries(entry.monthlyEarnings).map(([month, amount]) => (
                  <div key={month} className="rounded-2xl border p-4">
                    <p className="text-sm text-muted-foreground">{month}</p>
                    <p className="mt-2 font-semibold">{formatCurrency(amount)}</p>
                  </div>
                ))}
              </div>
            </div>
          </DataTableCard>
        ))}
      </div>
    </div>
  );
}
