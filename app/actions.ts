"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { expenseSchema, paymentSchema, payoutSchema, projectSchema, taskSchema } from "@/lib/validations";
import { recalculateProjectFinancials } from "@/lib/project-financials";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

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

async function requireUser() {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function saveTask(formData: FormData) {
  const session = await requireUser();
  const data = taskSchema.parse({
    id: formData.get("id") || undefined,
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    status: formData.get("status"),
    dueDate: formData.get("dueDate") || undefined,
    projectId: formData.get("projectId") || undefined,
    assignedToId: formData.get("assignedToId")
  });

  const payload = {
    title: data.title,
    description: data.description || null,
    status: data.status,
    dueDate: data.dueDate ? new Date(data.dueDate) : null,
    projectId: data.projectId || null,
    assignedToId: data.assignedToId,
    createdById: session.user.id
  };

  if (data.id) {
    const oldTask = await prisma.task.findUnique({ where: { id: data.id } });
    await prisma.task.update({
      where: { id: data.id },
      data: {
        title: payload.title,
        description: payload.description,
        status: payload.status,
        dueDate: payload.dueDate,
        projectId: payload.projectId,
        assignedToId: payload.assignedToId
      }
    });

    if (oldTask) {
      const messages: string[] = [];
      if (oldTask.assignedToId !== payload.assignedToId) {
        const assignee = await prisma.user.findUnique({ where: { id: payload.assignedToId } });
        messages.push(`reassigned task "${payload.title}" to ${assignee?.name || "a team member"}`);
      }
      if (oldTask.status !== payload.status) {
        messages.push(`changed status of "${payload.title}" to ${payload.status.replaceAll("_", " ")}`);
      }
      if (messages.length > 0) {
        await prisma.notification.create({
          data: {
            title: `Task Updated`,
            message: `${session.user.name} ${messages.join(" and ")}.`
          }
        });
      }
    }
  } else {
    await prisma.task.create({
      data: payload
    });

    const assignee = await prisma.user.findUnique({ where: { id: payload.assignedToId } });
    await prisma.notification.create({
      data: {
        title: `New Task Assigned`,
        message: `${session.user.name} assigned task "${payload.title}" to ${assignee?.name || "a team member"}.`
      }
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/tasks");
}

export async function updateTaskStatus(id: string, status: string) {
  const session = await requireUser();
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) throw new Error("Task not found");

  const oldStatus = task.status;
  await prisma.task.update({
    where: { id },
    data: { status }
  });

  if (oldStatus !== status) {
    await prisma.notification.create({
      data: {
        title: `Task Status Updated`,
        message: `${session.user.name} moved task "${task.title}" to ${status.replaceAll("_", " ")}.`
      }
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/tasks");
}

export async function deleteTask(id: string) {
  const session = await requireUser();
  const task = await prisma.task.findUnique({ where: { id } });
  await prisma.task.delete({ where: { id } });

  if (task) {
    await prisma.notification.create({
      data: {
        title: `Task Deleted`,
        message: `${session.user.name} deleted task "${task.title}".`
      }
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/tasks");
}

export async function saveLeadSheet(formData: FormData) {
  const session = await requireUser();
  if (session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  const assignedToId = formData.get("assignedToId") as string;
  const notes = formData.get("notes") as string || null;
  const givenFile = formData.get("givenFile") as File;

  if (!name || !assignedToId || !givenFile || givenFile.size === 0) {
    throw new Error("Missing required fields");
  }

  // Save the uploaded file
  const bytes = await givenFile.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const uniqueName = `${Date.now()}-${givenFile.name.replace(/\s+/g, "_")}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, uniqueName);
  await writeFile(filePath, buffer);
  const givenSheetUrl = `/uploads/${uniqueName}`;

  await prisma.leadSheet.create({
    data: {
      name,
      assignedToId,
      notes,
      givenSheetName: givenFile.name,
      givenSheetUrl,
      status: "PENDING"
    }
  });

  // Create a notification for the employee
  const assignee = await prisma.user.findUnique({ where: { id: assignedToId } });
  await prisma.notification.create({
    data: {
      title: "New Lead Sheet Assigned",
      message: `${session.user.name} assigned lead sheet "${name}" to ${assignee?.name || "you"}.`
    }
  });

  revalidatePath("/dashboard");
  revalidatePath("/leads");
}

export async function uploadResponseSheet(formData: FormData) {
  const session = await requireUser();
  const leadSheetId = formData.get("leadSheetId") as string;
  const responseFile = formData.get("responseFile") as File;

  if (!leadSheetId || !responseFile || responseFile.size === 0) {
    throw new Error("Missing required fields");
  }

  const leadSheet = await prisma.leadSheet.findUnique({
    where: { id: leadSheetId }
  });

  if (!leadSheet) {
    throw new Error("Lead sheet not found");
  }

  // Verify authorization (only assignee or admin)
  if (session.user.role !== "ADMIN" && leadSheet.assignedToId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  // Save the response file
  const bytes = await responseFile.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const uniqueName = `${Date.now()}-${responseFile.name.replace(/\s+/g, "_")}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, uniqueName);
  await writeFile(filePath, buffer);
  const responseSheetUrl = `/uploads/${uniqueName}`;

  await prisma.leadSheet.update({
    where: { id: leadSheetId },
    data: {
      status: "COMPLETED",
      responseSheetName: responseFile.name,
      responseSheetUrl
    }
  });

  // Create notification for admin
  await prisma.notification.create({
    data: {
      title: "Lead Sheet Completed",
      message: `${session.user.name} uploaded response for lead sheet "${leadSheet.name}".`
    }
  });

  revalidatePath("/dashboard");
  revalidatePath("/leads");
}

export async function deleteLeadSheet(id: string) {
  const session = await requireUser();
  if (session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  await prisma.leadSheet.delete({
    where: { id }
  });

  revalidatePath("/dashboard");
  revalidatePath("/leads");
}

