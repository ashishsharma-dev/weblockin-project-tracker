import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { DataTableCard } from "@/components/data-table-card";
import { ExpenseForm } from "@/components/forms/expense-form";

export default async function EditExpensePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") notFound();
  const { id } = await params;
  const [expense, projects] = await Promise.all([
    prisma.expense.findUnique({ where: { id } }),
    prisma.project.findMany({ select: { id: true, name: true } })
  ]);
  if (!expense) notFound();

  return (
    <div className="space-y-6">
      <PageHeader title="Edit Expense" description="Update the cost item and keep project-level profitability in sync." />
      <DataTableCard title={expense.title}>
        <ExpenseForm expense={expense} projects={projects} />
      </DataTableCard>
    </div>
  );
}
