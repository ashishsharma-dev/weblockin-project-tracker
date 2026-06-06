import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { expenseCategories, partnerCodes, paymentModes, projectStatuses, roles } from "../lib/domain";
import { recalculateProjectFinancials } from "../lib/project-financials";

const prisma = new PrismaClient();

async function main() {
  await prisma.projectPartnerEarning.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.payout.deleteMany();
  await prisma.project.deleteMany();
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();
  await prisma.partner.deleteMany();
  await prisma.notification.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  const [partnerAshish, partnerKush, partnerAnkit, partnerMahrishi] = await Promise.all([
    prisma.partner.create({ data: { code: partnerCodes.Ashish, name: "Ashish Sharma", email: "ashish@weblockin.local" } }),
    prisma.partner.create({ data: { code: partnerCodes.Kush, name: "Kush Sharma", email: "kush@weblockin.local" } }),
    prisma.partner.create({ data: { code: partnerCodes.Ankit, name: "Ankit Verma", email: "ankit@weblockin.local" } }),
    prisma.partner.create({ data: { code: partnerCodes.Mahrishi, name: "Mahrishi Gunani", email: "mahrishi@weblockin.local" } })
  ]);

  const adminUser = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@weblockin.local",
      passwordHash,
      role: roles.ADMIN
    }
  });

  const [userAshish, userKush, userAnkit, userMahrishi] = await Promise.all([
    prisma.user.create({ data: { name: "Ashish Sharma", email: "ashish@weblockin.local", passwordHash, role: roles.PARTNER, partnerId: partnerAshish.id } }),
    prisma.user.create({ data: { name: "Kush Sharma", email: "kush@weblockin.local", passwordHash, role: roles.PARTNER, partnerId: partnerKush.id } }),
    prisma.user.create({ data: { name: "Ankit Verma", email: "ankit@weblockin.local", passwordHash, role: roles.PARTNER, partnerId: partnerAnkit.id } }),
    prisma.user.create({ data: { name: "Mahrishi Gunani", email: "mahrishi@weblockin.local", passwordHash, role: roles.PARTNER, partnerId: partnerMahrishi.id } })
  ]);

  const projectOne = await prisma.project.create({
    data: {
      name: "Zen Commerce Website",
      clientName: "Zen Retail Pvt Ltd",
      clientEmail: "ops@zenretail.in",
      clientPhone: "+91 90000 11111",
      description: "E-commerce platform redesign with payment integration.",
      projectValue: 100000,
      amountReceived: 60000,
      amountPending: 40000,
      expensesTotal: 10000,
      netProfit: 90000,
      leadPool: 36000,
      developerPool: 54000,
      status: projectStatuses.IN_PROGRESS,
      startDate: new Date("2026-04-05"),
      deliveryDate: new Date("2026-06-20"),
      paymentDueDate: new Date("2026-06-25"),
      notes: "Priority client.",
      leadContributorCodes: "Ankit,Mahrishi",
      developerContributorCodes: "Ashish"
    }
  });

  const projectTwo = await prisma.project.create({
    data: {
      name: "Northstar CRM Portal",
      clientName: "Northstar Advisory",
      clientEmail: "it@northstar.com",
      clientPhone: "+91 98888 55555",
      description: "Internal CRM and reporting dashboard.",
      projectValue: 180000,
      amountReceived: 180000,
      amountPending: 0,
      expensesTotal: 35000,
      netProfit: 145000,
      leadPool: 58000,
      developerPool: 87000,
      status: projectStatuses.COMPLETED,
      startDate: new Date("2026-02-10"),
      deliveryDate: new Date("2026-04-18"),
      paymentDueDate: new Date("2026-04-25"),
      notes: "AMC upsell opportunity.",
      leadContributorCodes: "Mahrishi",
      developerContributorCodes: "Ashish,Kush"
    }
  });

  await prisma.expense.createMany({
    data: [
      { title: "Hosting", amount: 4000, date: new Date("2026-04-12"), category: expenseCategories.HOSTING, projectId: projectOne.id },
      { title: "Plugin Licenses", amount: 6000, date: new Date("2026-04-14"), category: expenseCategories.SOFTWARE, projectId: projectOne.id },
      { title: "Marketing Campaign", amount: 20000, date: new Date("2026-02-14"), category: expenseCategories.MARKETING, projectId: projectTwo.id },
      { title: "QA Support", amount: 15000, date: new Date("2026-03-03"), category: expenseCategories.SALARY, projectId: projectTwo.id }
    ]
  });

  await prisma.payment.createMany({
    data: [
      { projectId: projectOne.id, paymentDate: new Date("2026-04-15"), amount: 40000, paymentMode: paymentModes.BANK_TRANSFER, transactionId: "TXN-001" },
      { projectId: projectOne.id, paymentDate: new Date("2026-05-05"), amount: 20000, paymentMode: paymentModes.UPI, transactionId: "TXN-002" },
      { projectId: projectTwo.id, paymentDate: new Date("2026-02-22"), amount: 80000, paymentMode: paymentModes.BANK_TRANSFER, transactionId: "TXN-003" },
      { projectId: projectTwo.id, paymentDate: new Date("2026-04-22"), amount: 100000, paymentMode: paymentModes.RAZORPAY, transactionId: "TXN-004" }
    ]
  });

  await prisma.payout.createMany({
    data: [
      { partnerId: partnerAshish.id, amount: 70000, date: new Date("2026-05-10"), paymentMode: paymentModes.BANK_TRANSFER, remarks: "Monthly payout" },
      { partnerId: partnerAnkit.id, amount: 20000, date: new Date("2026-05-10"), paymentMode: paymentModes.UPI, remarks: "Lead payout" },
      { partnerId: partnerMahrishi.id, amount: 38000, date: new Date("2026-05-28"), paymentMode: paymentModes.BANK_TRANSFER, remarks: "Project payout" }
    ]
  });

  await prisma.task.createMany({
    data: [
      {
        title: "Framer High-Fidelity Mockups",
        description: "Design and export Framer mockups for the landing page.",
        status: "COMPLETED",
        dueDate: new Date("2026-05-15"),
        projectId: projectOne.id,
        assignedToId: userAshish.id,
        createdById: adminUser.id
      },
      {
        title: "Stripe API Integration",
        description: "Implement billing cycles and webhook listeners.",
        status: "IN_PROGRESS",
        dueDate: new Date("2026-06-18"),
        projectId: projectOne.id,
        assignedToId: userAshish.id,
        createdById: adminUser.id
      },
      {
        title: "Database Index Optimization",
        description: "Analyze slow query logs and index foreign keys.",
        status: "COMPLETED",
        dueDate: new Date("2026-04-10"),
        projectId: projectTwo.id,
        assignedToId: userKush.id,
        createdById: adminUser.id
      },
      {
        title: "Feedback Form Bugfix",
        description: "Fix submit handler error on mobile browsers.",
        status: "PENDING",
        dueDate: new Date("2026-06-25"),
        projectId: projectTwo.id,
        assignedToId: userAnkit.id,
        createdById: userAshish.id
      },
      {
        title: "Domain and SSL setup",
        description: "Map domain to Vercel and renew SSL certificate.",
        status: "PENDING",
        dueDate: new Date("2026-06-10"),
        assignedToId: userMahrishi.id,
        createdById: adminUser.id
      }
    ]
  });

  await recalculateProjectFinancials(prisma, projectOne.id);
  await recalculateProjectFinancials(prisma, projectTwo.id);

  await prisma.notification.createMany({
    data: [
      { title: "Payment Due", message: "Zen Commerce Website has ₹40,000 pending." },
      { title: "Project Delivered", message: "Northstar CRM Portal marked as completed." }
    ]
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
