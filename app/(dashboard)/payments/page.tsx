import Link from "next/link";
import { deletePayment } from "@/app/actions";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { DataTableCard } from "@/components/data-table-card";
import { PaymentForm } from "@/components/forms/payment-form";
import { DeleteButton } from "@/components/delete-button";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { auth } from "@/auth";
import { getScopedProjects } from "@/lib/data";
import { AddEntryDialog } from "@/components/add-entry-dialog";

export default async function PaymentsPage() {
  const session = await auth();
  const projects = await getScopedProjects();
  const payments = await prisma.payment.findMany({
    where: session?.user.role === "PARTNER" && session.user.partnerCode
      ? {
          project: {
            OR: [
              { leadContributorCodes: { contains: session.user.partnerCode } },
              { developerContributorCodes: { contains: session.user.partnerCode } }
            ]
          }
        }
      : undefined,
    include: { project: true },
    orderBy: { paymentDate: "desc" }
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Payments" description="Watch incoming client collections and their impact on pending dues.">
        {session?.user.role === "ADMIN" ? (
          <AddEntryDialog title="Record Payment" buttonText="Record Payment">
            <PaymentForm projects={projects.map((project) => ({ id: project.id, name: project.name }))} />
          </AddEntryDialog>
        ) : null}
      </PageHeader>

      <DataTableCard title="Payment Register">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Transaction</TableHead>
              <TableHead>Amount</TableHead>
              {session?.user.role === "ADMIN" ? <TableHead>Actions</TableHead> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>{payment.project.name}</TableCell>
                <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                <TableCell>{payment.paymentMode}</TableCell>
                <TableCell>{payment.transactionId ?? "--"}</TableCell>
                <TableCell>{formatCurrency(payment.amount.toString())}</TableCell>
                {session?.user.role === "ADMIN" ? (
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/payments/${payment.id}`}>Edit</Link>
                      </Button>
                      <form action={deletePayment.bind(null, payment.id, payment.projectId)}>
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
