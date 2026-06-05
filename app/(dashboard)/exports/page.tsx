import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { DataTableCard } from "@/components/data-table-card";
import { Button } from "@/components/ui/button";

const exportTargets = [
  { label: "Projects", type: "projects" },
  { label: "Payments", type: "payments" },
  { label: "Expenses", type: "expenses" },
  { label: "Partner Earnings", type: "earnings" },
  { label: "Payouts", type: "payouts" }
];

export default function ExportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Exports" description="Download operational data in CSV, Excel, or PDF for reviews, payroll, and backups." />
      <div className="grid gap-4 xl:grid-cols-2">
        {exportTargets.map((target) => (
          <DataTableCard key={target.type} title={target.label}>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href={`/api/export/${target.type}?format=csv`}>CSV</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/api/export/${target.type}?format=excel`}>Excel</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/api/export/${target.type}?format=pdf`}>PDF</Link>
              </Button>
            </div>
          </DataTableCard>
        ))}
      </div>
    </div>
  );
}
