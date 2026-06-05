"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { expenseSchema, paymentSchema, payoutSchema, projectSchema } from "@/lib/validations";
import { recalculateProjectFinancials } from "@/lib/project-financials";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

export async function saveProject(formData: FormData) {
  await requireAdmin();
  const data = projectSchema.parse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    clientName: formData.get("clientName"),
    clientEmail: formData.get("clientEmail"),
    clientPhone: formData.get("clientPhone"),
    description: formData.get("description"),
    projectValue: formData.get("projectValue"),
    status: formData.get("status"),
    leadContributorCodes: formData.getAll("leadContributorCodes"),
    developerContributorCodes: formData.getAll("developerContributorCodes"),
    startDate: formData.get("startDate"),
    deliveryDate: formData.get("deliveryDate"),
    paymentDueDate: formData.get("paymentDueDate"),
    notes: formData.get("notes")
  });

  const payload = {
    name: data.name,
    clientName: data.clientName,
    clientEmail: data.clientEmail || null,
    clientPhone: data.clientPhone || null,
    description: data.description || null,
    projectValue: data.projectValue,
    status: data.status,
    leadContributorCodes: data.leadContributorCodes.join(","),
    developerContributorCodes: data.developerContributorCodes.join(","),
    startDate: data.startDate ? new Date(data.startDate) : null,
    deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : null,
    paymentDueDate: data.paymentDueDate ? new Date(data.paymentDueDate) : null,
    notes: data.notes || null
  };

  const project = data.id
    ? await prisma.project.update({ where: { id: data.id }, data: payload })
    : await prisma.project.create({
        data: {
          ...payload,
          amountReceived: 0,
          amountPending: data.projectValue
        }
      });

  await recalculateProjectFinancials(prisma, project.id);
  revalidatePath("/dashboard");
  revalidatePath("/projects");
}

export async function deleteProject(id: string) {
  await requireAdmin();
  await prisma.project.delete({ where: { id } });
  revalidatePath("/dashboard");
  revalidatePath("/projects");
}

export async function saveExpense(formData: FormData) {
  await requireAdmin();
  const data = expenseSchema.parse({
    id: formData.get("id") || undefined,
    title: formData.get("title"),
    amount: formData.get("amount"),
    date: formData.get("date"),
    category: formData.get("category"),
    projectId: formData.get("projectId") || undefined,
    notes: formData.get("notes")
  });

  const expense = data.id
    ? await prisma.expense.update({
        where: { id: data.id },
        data: {
          title: data.title,
          amount: data.amount,
          date: new Date(data.date),
          category: data.category,
          projectId: data.projectId || null,
          notes: data.notes || null
        }
      })
    : await prisma.expense.create({
        data: {
          title: data.title,
          amount: data.amount,
          date: new Date(data.date),
          category: data.category,
          projectId: data.projectId || null,
          notes: data.notes || null
        }
      });

  if (expense.projectId) await recalculateProjectFinancials(prisma, expense.projectId);
  revalidatePath("/dashboard");
  revalidatePath("/expenses");
  revalidatePath("/projects");
}

export async function deleteExpense(id: string, projectId?: string | null) {
  await requireAdmin();
  await prisma.expense.delete({ where: { id } });
  if (projectId) await recalculateProjectFinancials(prisma, projectId);
  revalidatePath("/dashboard");
  revalidatePath("/expenses");
  revalidatePath("/projects");
}

export async function savePayment(formData: FormData) {
  await requireAdmin();
  const data = paymentSchema.parse({
    id: formData.get("id") || undefined,
    projectId: formData.get("projectId"),
    paymentDate: formData.get("paymentDate"),
    amount: formData.get("amount"),
    paymentMode: formData.get("paymentMode"),
    transactionId: formData.get("transactionId"),
    notes: formData.get("notes")
  });

  await prisma.payment.upsert({
    where: { id: data.id ?? "create-new-payment" },
    update: {
      projectId: data.projectId,
      paymentDate: new Date(data.paymentDate),
      amount: data.amount,
      paymentMode: data.paymentMode,
      transactionId: data.transactionId || null,
      notes: data.notes || null
    },
    create: {
      projectId: data.projectId,
      paymentDate: new Date(data.paymentDate),
      amount: data.amount,
      paymentMode: data.paymentMode,
      transactionId: data.transactionId || null,
      notes: data.notes || null
    }
  });

  await recalculateProjectFinancials(prisma, data.projectId);
  revalidatePath("/dashboard");
  revalidatePath("/payments");
  revalidatePath("/projects");
}

export async function deletePayment(id: string, projectId: string) {
  await requireAdmin();
  await prisma.payment.delete({ where: { id } });
  await recalculateProjectFinancials(prisma, projectId);
  revalidatePath("/dashboard");
  revalidatePath("/payments");
  revalidatePath("/projects");
}

export async function savePayout(formData: FormData) {
  await requireAdmin();
  const data = payoutSchema.parse({
    id: formData.get("id") || undefined,
    partnerId: formData.get("partnerId"),
    amount: formData.get("amount"),
    date: formData.get("date"),
    paymentMode: formData.get("paymentMode"),
    remarks: formData.get("remarks")
  });

  await prisma.payout.upsert({
    where: { id: data.id ?? "create-new-payout" },
    update: {
      partnerId: data.partnerId,
      amount: data.amount,
      date: new Date(data.date),
      paymentMode: data.paymentMode,
      remarks: data.remarks || null
    },
    create: {
      partnerId: data.partnerId,
      amount: data.amount,
      date: new Date(data.date),
      paymentMode: data.paymentMode,
      remarks: data.remarks || null
    }
  });

  revalidatePath("/payouts");
  revalidatePath("/ledger");
  revalidatePath("/dashboard");
}

export async function deletePayout(id: string) {
  await requireAdmin();
  await prisma.payout.delete({ where: { id } });
  revalidatePath("/payouts");
  revalidatePath("/ledger");
  revalidatePath("/dashboard");
}
