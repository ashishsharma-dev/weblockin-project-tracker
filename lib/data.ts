import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "./prisma";

export async function getSessionGuard() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  return session;
}

export async function getScopedProjects() {
  const session = await getSessionGuard();
  const where: Prisma.ProjectWhereInput =
    session.user.role === "PARTNER" && session.user.partnerCode
      ? {
          OR: [
            { leadContributorCodes: { contains: session.user.partnerCode } },
            { developerContributorCodes: { contains: session.user.partnerCode } }
          ]
        }
      : {};

  return prisma.project.findMany({
    where,
    include: {
      earnings: { include: { partner: true } },
      expenses: true,
      payments: true
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function getDashboardMetrics() {
  const session = await getSessionGuard();
  const projects = await getScopedProjects();
  const partners = await prisma.partner.findMany({
    where: session.user.role === "PARTNER" ? { code: session.user.partnerCode as any } : undefined,
    include: {
      earnings: true,
      payouts: true
    }
  });
  const expenses = await prisma.expense.findMany();
  const openLeads = await prisma.leadSheet.count({
    where: session.user.role === "PARTNER"
      ? { assignedToId: session.user.id, status: { not: "COMPLETED" } }
      : { status: { not: "COMPLETED" } }
  });

  const totalRevenue = projects.reduce((sum, project) => sum + Number(project.projectValue), 0);
  const totalExpenses = projects.reduce((sum, project) => sum + Number(project.expensesTotal), 0);
  const netProfit = projects.reduce((sum, project) => sum + Number(project.netProfit), 0);
  const pendingClientPayments = projects.reduce((sum, project) => sum + Number(project.amountPending), 0);
  const completedProjects = projects.filter((project) => project.status === "COMPLETED").length;
  const activeProjects = projects.filter((project) => project.status === "IN_PROGRESS").length;

  const partnerWise = partners.map((partner) => {
    const totalEarnings = partner.earnings.reduce((sum, earning) => sum + Number(earning.amount), 0);
    const totalPaid = partner.payouts.reduce((sum, payout) => sum + Number(payout.amount), 0);
    return {
      partner: partner.name,
      earnings: totalEarnings,
      paid: totalPaid,
      pending: totalEarnings - totalPaid
    };
  });

  const monthlyMap = new Map<string, { revenue: number; profit: number; expenses: number }>();
  for (const project of projects) {
    const key = new Intl.DateTimeFormat("en-IN", { month: "short", year: "2-digit" }).format(project.createdAt);
    const current = monthlyMap.get(key) ?? { revenue: 0, profit: 0, expenses: 0 };
    current.revenue += Number(project.projectValue);
    current.profit += Number(project.netProfit);
    current.expenses += Number(project.expensesTotal);
    monthlyMap.set(key, current);
  }

  const expenseByCategory = expenses.reduce<Record<string, number>>((acc, expense) => {
    acc[expense.category] = (acc[expense.category] ?? 0) + Number(expense.amount);
    return acc;
  }, {});

  return {
    totalRevenue,
    totalExpenses,
    netProfit,
    pendingClientPayments,
    completedProjects,
    activeProjects,
    openLeads,
    partnerWise,
    monthlySeries: [...monthlyMap.entries()].map(([month, values]) => ({ month, ...values })),
    expenseBreakdown: Object.entries(expenseByCategory).map(([name, value]) => ({ name, value }))
  };
}

export async function getPartnerLedger() {
  const session = await getSessionGuard();
  const partners = await prisma.partner.findMany({
    where: session.user.role === "PARTNER" ? { code: session.user.partnerCode as any } : undefined,
    include: {
      earnings: {
        include: { project: true }
      },
      payouts: true
    },
    orderBy: { code: "asc" }
  });

  return partners.map((partner) => {
    const totalEarnings = partner.earnings.reduce((sum, earning) => sum + Number(earning.amount), 0);
    const totalPaid = partner.payouts.reduce((sum, payout) => sum + Number(payout.amount), 0);

    return {
      id: partner.id,
      code: partner.code,
      name: partner.name,
      totalEarnings,
      totalPaid,
      pendingPayout: totalEarnings - totalPaid,
      projectsInvolved: new Set(partner.earnings.map((earning) => earning.projectId)).size,
      monthlyEarnings: partner.earnings.reduce<Record<string, number>>((acc, earning) => {
        const key = new Intl.DateTimeFormat("en-IN", { month: "short", year: "2-digit" }).format(earning.project.createdAt);
        acc[key] = (acc[key] ?? 0) + Number(earning.amount);
        return acc;
      }, {})
    };
  });
}
