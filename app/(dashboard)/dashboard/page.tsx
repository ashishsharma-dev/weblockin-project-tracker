import { PageHeader } from "@/components/page-header";
import { MetricCard } from "@/components/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardMetrics } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ExpenseBreakdownChart, RevenueProfitChart } from "@/components/charts/dashboard-charts";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  const [metrics, myTasks, recentNotifications] = await Promise.all([
    getDashboardMetrics(),
    userId
      ? prisma.task.findMany({
          where: {
            assignedToId: userId,
            status: { notIn: ["COMPLETED", "CANCELLED"] }
          },
          include: { project: true },
          orderBy: { dueDate: "asc" },
          take: 5
        })
      : Promise.resolve([]),
    prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
      take: 5
    })
  ]);

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

      <div className="grid gap-6 md:grid-cols-2">
        {/* My Tasks */}
        <Card className="rounded-2xl border bg-card text-card-foreground shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-0.5">
              <CardTitle className="text-lg font-bold">My Tasks</CardTitle>
              <p className="text-xs text-muted-foreground">Your active deliverables and deadlines.</p>
            </div>
            <ButtonVariantWrapper />
          </CardHeader>
          <CardContent className="space-y-4">
            {myTasks.length ? (
              myTasks.map((task) => {
                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
                return (
                  <div key={task.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0 transition-all hover:bg-muted/30 px-2 py-1.5 rounded-xl">
                    <div className="space-y-1">
                      <Link href={`/tasks/${task.id}`} className="font-semibold text-sm hover:underline hover:text-primary">
                        {task.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {task.project?.name ?? "General Tasks"}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <Badge className={
                        task.status === "IN_PROGRESS"
                          ? "bg-blue-600/10 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50"
                          : "bg-muted text-muted-foreground border"
                      }>
                        {task.status.replaceAll("_", " ")}
                      </Badge>
                      {task.dueDate && (
                        <p className={`text-[10px] font-semibold ${isOverdue ? "text-destructive" : "text-muted-foreground"}`}>
                          Due: {formatDate(task.dueDate)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="py-6 text-center text-sm text-muted-foreground">No pending tasks. Great job!</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity & System Alerts */}
        <Card className="rounded-2xl border bg-card text-card-foreground shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Recent Activity & System Alerts</CardTitle>
            <p className="text-xs text-muted-foreground">Latest events and project updates.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentNotifications.length ? (
              recentNotifications.map((notif) => (
                <div key={notif.id} className="flex flex-col border-b pb-3 last:border-0 last:pb-0 px-2 py-1.5 rounded-xl hover:bg-muted/30">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">{notif.title}</p>
                    <span className="text-[10px] text-muted-foreground">{formatDate(notif.createdAt)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{notif.message}</p>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-sm text-muted-foreground">No recent alerts.</p>
            )}
          </CardContent>
        </Card>
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

function ButtonVariantWrapper() {
  return (
    <Link href="/tasks" className="rounded-xl border px-3 py-1.5 text-xs hover:bg-muted font-medium transition-colors">
      View All
    </Link>
  );
}

