import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const projectSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  clientName: z.string().min(2),
  clientEmail: z.string().email().optional().or(z.literal("")),
  clientPhone: z.string().optional(),
  description: z.string().optional(),
  projectValue: z.coerce.number().min(0),
  status: z.enum(["LEAD_RECEIVED", "PROPOSAL_SENT", "NEGOTIATION", "IN_PROGRESS", "COMPLETED", "ON_HOLD", "CANCELLED"]),
  leadContributorCodes: z.array(z.enum(["Ankit", "Mahrishi"])).min(1).max(2),
  developerContributorCodes: z.array(z.enum(["Ashish", "Kush"])).min(1).max(2),
  startDate: z.string().optional(),
  deliveryDate: z.string().optional(),
  paymentDueDate: z.string().optional(),
  notes: z.string().optional()
});

export const expenseSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2),
  amount: z.coerce.number().min(0),
  date: z.string(),
  category: z.enum(["HOSTING", "DOMAIN", "MARKETING", "SOFTWARE", "SALARY", "MISCELLANEOUS"]),
  projectId: z.string().optional(),
  notes: z.string().optional()
});

export const paymentSchema = z.object({
  id: z.string().optional(),
  projectId: z.string().min(1),
  paymentDate: z.string(),
  amount: z.coerce.number().min(0),
  paymentMode: z.enum(["UPI", "BANK_TRANSFER", "CASH", "CHEQUE", "PAYPAL", "RAZORPAY"]),
  transactionId: z.string().optional(),
  notes: z.string().optional()
});

export const payoutSchema = z.object({
  id: z.string().optional(),
  partnerId: z.string().min(1),
  amount: z.coerce.number().min(0),
  date: z.string(),
  paymentMode: z.enum(["UPI", "BANK_TRANSFER", "CASH", "CHEQUE", "PAYPAL", "RAZORPAY"]),
  remarks: z.string().optional()
});

export const taskSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2),
  description: z.string().optional(),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
  dueDate: z.string().optional().or(z.literal("")),
  projectId: z.string().optional().or(z.literal("")),
  assignedToId: z.string().min(1)
});
