import Link from "next/link";
import { deletePayout } from "@/app/actions";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { DataTableCard } from "@/components/data-table-card";
import { PayoutForm } from "@/components/forms/payout-form";
import { DeleteButton } from "@/components/delete-button";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { auth } from "@/auth";

export default async function PayoutsPage() {
  const session = await auth();
  const payouts = await prisma.payout.findMany({
    where: session?.user.role === "PARTNER" ? { partner: { code: session.user.partnerCode as any } } : undefined,
    include: { partner: true },
    orderBy: { date: "desc" }
  });
  const partners = await prisma.partner.findMany({ select: { id: true, name: true } });

  return (
    <div className="space-y-6">
      <PageHeader title="Payouts" description="Track partner disbursements and keep pending balances visible." />
      {session?.user.role === "ADMIN" ? (
        <DataTableCard title="Create Payout">
          <PayoutForm partners={partners} />
        </DataTableCard>
      ) : null}
      <DataTableCard title="Payout Register">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Partner</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Remarks</TableHead>
              <TableHead>Amount</TableHead>
              {session?.user.role === "ADMIN" ? <TableHead>Actions</TableHead> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {payouts.map((payout) => (
              <TableRow key={payout.id}>
                <TableCell>{payout.partner.name}</TableCell>
                <TableCell>{formatDate(payout.date)}</TableCell>
                <TableCell>{payout.paymentMode}</TableCell>
                <TableCell>{payout.remarks ?? "--"}</TableCell>
                <TableCell>{formatCurrency(payout.amount.toString())}</TableCell>
                {session?.user.role === "ADMIN" ? (
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/payouts/${payout.id}`}>Edit</Link>
                      </Button>
                      <form action={deletePayout.bind(null, payout.id)}>
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
