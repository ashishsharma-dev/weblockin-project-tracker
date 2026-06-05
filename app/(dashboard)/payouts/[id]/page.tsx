import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { DataTableCard } from "@/components/data-table-card";
import { PayoutForm } from "@/components/forms/payout-form";

export default async function EditPayoutPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") notFound();
  const { id } = await params;
  const [payout, partners] = await Promise.all([
    prisma.payout.findUnique({ where: { id } }),
    prisma.partner.findMany({ select: { id: true, name: true } })
  ]);
  if (!payout) notFound();

  return (
    <div className="space-y-6">
      <PageHeader title="Edit Payout" description="Maintain a clean payout history and pending balances for each partner." />
      <DataTableCard title="Edit Payout">
        <PayoutForm payout={payout} partners={partners} />
      </DataTableCard>
    </div>
  );
}
