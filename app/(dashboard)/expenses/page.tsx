import Link from "next/link";
import { deleteExpense } from "@/app/actions";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { DataTableCard } from "@/components/data-table-card";
import { ExpenseForm } from "@/components/forms/expense-form";
import { DeleteButton } from "@/components/delete-button";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function ExpensesPage() {
  const session = await auth();
  if (session?.user.role === "PARTNER") redirect("/dashboard");
  const [expenses, projects] = await Promise.all([
    prisma.expense.findMany({ include: { project: true }, orderBy: { date: "desc" } }),
    prisma.project.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } })
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Expenses" description="Keep project costs accurate so partner earnings always reflect real net profit." />
      {session?.user.role === "ADMIN" ? (
        <DataTableCard title="Log Expense">
          <ExpenseForm projects={projects} />
        </DataTableCard>
      ) : null}
      <DataTableCard title="Expense Register">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              {session?.user.role === "ADMIN" ? <TableHead>Actions</TableHead> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell>{expense.title}</TableCell>
                <TableCell>{expense.category}</TableCell>
                <TableCell>{expense.project?.name ?? "General"}</TableCell>
                <TableCell>{formatDate(expense.date)}</TableCell>
                <TableCell>{formatCurrency(expense.amount.toString())}</TableCell>
                {session?.user.role === "ADMIN" ? (
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/expenses/${expense.id}`}>Edit</Link>
                      </Button>
                      <form action={deleteExpense.bind(null, expense.id, expense.projectId)}>
                        <DeleteButton />
                      </form>
                    </div>
                  </TableCell>
                ) : null}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DataTableCard>
    </div>
  );
}
