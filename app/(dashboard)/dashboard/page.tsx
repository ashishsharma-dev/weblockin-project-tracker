import { PageHeader } from "@/components/page-header";
import { MetricCard } from "@/components/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardMetrics } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import { ExpenseBreakdownChart, RevenueProfitChart } from "@/components/charts/dashboard-charts";

export default async function DashboardPage() {
  const metrics = await getDashboardMetrics();

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Agency-wide financial pulse with partner earnings, collections, and profitability." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <MetricCard label="Total Revenue" value={metrics.totalRevenue} currency />
        <MetricCard label="Total Expenses" value={metrics.totalExpenses} currency />
        <MetricCard label="Net Profit" value={metrics.netProfit} currency />
        <MetricCard label="Pending Client Payments" value={metrics.pendingClientPayments} currency />
        <MetricCard label="Completed Projects" value={metrics.completedProjects} />
        <MetricCard label="Active Projects" value={metrics.activeProjects} />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <RevenueProfitChart data={metrics.monthlySeries} />
        <ExpenseBreakdownChart data={metrics.expenseBreakdown} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Partner-wise Earnings</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.partnerWise.map((item) => (
            <div key={item.partner} className="rounded-2xl bg-muted/60 p-4">
              <p className="text-sm text-muted-foreground">{item.partner}</p>
              <p className="mt-2 text-lg font-semibold">{formatCurrency(item.earnings)}</p>
              <p className="text-xs text-muted-foreground">Paid: {formatCurrency(item.paid)}</p>
              <p className="text-xs text-muted-foreground">Pending: {formatCurrency(item.pending)}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
