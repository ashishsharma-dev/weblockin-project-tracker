import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { DataTableCard } from "@/components/data-table-card";
import { PaymentForm } from "@/components/forms/payment-form";

export default async function EditPaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") notFound();
  const { id } = await params;
  const [payment, projects] = await Promise.all([
    prisma.payment.findUnique({ where: { id } }),
    prisma.project.findMany({ select: { id: true, name: true } })
  ]);
  if (!payment) notFound();

  return (
    <div className="space-y-6">
      <PageHeader title="Edit Payment" description="Revise payment records and refresh pending balances automatically." />
      <DataTableCard title={`Payment for ${payment.projectId}`}>
        <PaymentForm payment={payment} projects={projects} />
      </DataTableCard>
    </div>
  );
}
