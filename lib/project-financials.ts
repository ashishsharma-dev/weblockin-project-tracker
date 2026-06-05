import { PrismaClient } from "@prisma/client";
import { contributionTypes } from "./domain";
import { calculateProfitSplit, type PartnerCode } from "./profit-split";

export async function recalculateProjectFinancials(prisma: PrismaClient, projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { expenses: true }
  });

  if (!project) {
    throw new Error("Project not found.");
  }

  const partners = await prisma.partner.findMany();
  const expensesTotal = project.expenses.reduce((total, expense) => total + Number(expense.amount), 0);
  const paymentAgg = await prisma.payment.aggregate({
    where: { projectId },
    _sum: { amount: true }
  });
  const amountReceived = Number(paymentAgg._sum.amount || 0);
  const amountPending = Math.max(Number(project.projectValue) - amountReceived, 0);
  const leadContributors = project.leadContributorCodes.split(",").filter(Boolean) as PartnerCode[];
  const developerContributors = project.developerContributorCodes.split(",").filter(Boolean) as PartnerCode[];

  const split = calculateProfitSplit({
    projectValue: Number(project.projectValue),
    expensesTotal,
    leadContributors,
    developerContributors
  });

  await prisma.$transaction(async (tx) => {
    await tx.project.update({
      where: { id: projectId },
      data: {
        amountReceived,
        amountPending,
        expensesTotal,
        netProfit: split.netProfit,
        leadPool: split.leadPool,
        developerPool: split.developerPool
      }
    });

    await tx.projectPartnerEarning.deleteMany({ where: { projectId } });

    const earnings = partners
      .map((partner) => {
        const code = partner.code as PartnerCode;
        const amount = split.partnerAmounts[code];
        if (!amount) return null;
        const contributionType = leadContributors.includes(code)
          ? contributionTypes.LEAD
          : contributionTypes.DEVELOPMENT;
        const percentage = split.netProfit > 0 ? (amount / split.netProfit) * 100 : 0;

        return {
          projectId,
          partnerId: partner.id,
          contributionType,
          amount,
          percentage
        };
      })
      .filter(Boolean) as {
      projectId: string;
      partnerId: string;
      contributionType: string;
      amount: number;
      percentage: number;
    }[];

    if (earnings.length) {
      await tx.projectPartnerEarning.createMany({ data: earnings });
    }
  });
}
