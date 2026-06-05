import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { DataTableCard } from "@/components/data-table-card";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function ReportsPage({
  searchParams
}: {
  searchParams: Promise<{ partner?: string; status?: string; client?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;
  const projects = await prisma.project.findMany({
    where: {
      ...(session?.user.role === "PARTNER" && session.user.partnerCode
        ? {
            OR: [
              { leadContributorCodes: { contains: session.user.partnerCode } },
              { developerContributorCodes: { contains: session.user.partnerCode } }
            ]
          }
        : {}),
      status: params.status as any || undefined,
      clientName: params.client ? { contains: params.client } : undefined,
      earnings: params.partner
        ? {
            some: {
              partner: {
                code: params.partner as any
              }
            }
          }
        : undefined
    },
    include: {
      earnings: { include: { partner: true } },
      payments: true
    },
    orderBy: { createdAt: "desc" }
  });

  const pendingPayments = projects.filter((project) => Number(project.amountPending) > 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="Filter the project and partner picture without leaving the dashboard." />
      <DataTableCard title="Filters" description="Use query params like `?partner=Ashish&status=COMPLETED&client=Zen` for quick report slices.">
        <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
          <div className="rounded-2xl border p-4">Partner: {params.partner ?? "All"}</div>
          <div className="rounded-2xl border p-4">Status: {params.status ?? "All"}</div>
          <div className="rounded-2xl border p-4">Client: {params.client ?? "All"}</div>
        </div>
      </DataTableCard>
      <DataTableCard title="Project Report">
        <div className="space-y-4">
          {projects.map((project) => (
            <div key={project.id} className="rounded-3xl border p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{project.name}</h3>
                  <p className="text-sm text-muted-foreground">{project.clientName}</p>
                </div>
                <div className="text-sm text-muted-foreground">
                  Due {formatDate(project.paymentDueDate)} · {project.status.replaceAll("_", " ")}
                </div>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-4">
                <div className="rounded-2xl bg-muted/60 p-4">Revenue: {formatCurrency(project.projectValue.toString())}</div>
                <div className="rounded-2xl bg-muted/60 p-4">Expenses: {formatCurrency(project.expensesTotal.toString())}</div>
                <div className="rounded-2xl bg-muted/60 p-4">Net Profit: {formatCurrency(project.netProfit.toString())}</div>
                <div className="rounded-2xl bg-muted/60 p-4">Pending: {formatCurrency(project.amountPending.toString())}</div>
              </div>
            </div>
          ))}
        </div>
      </DataTableCard>
      <DataTableCard title="Pending Payments">
        <div className="space-y-3">
          {pendingPayments.map((project) => (
            <div key={project.id} className="flex items-center justify-between rounded-2xl border p-4">
              <div>
                <p className="font-medium">{project.name}</p>
                <p className="text-sm text-muted-foreground">{project.clientName}</p>
              </div>
              <p className="font-semibold">{formatCurrency(project.amountPending.toString())}</p>
            </div>
          ))}
        </div>
      </DataTableCard>
    </div>
  );
}
