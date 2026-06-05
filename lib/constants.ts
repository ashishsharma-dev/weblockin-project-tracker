export const projectStatusOptions = [
  { label: "Lead Received", value: "LEAD_RECEIVED" },
  { label: "Proposal Sent", value: "PROPOSAL_SENT" },
  { label: "Negotiation", value: "NEGOTIATION" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Completed", value: "COMPLETED" },
  { label: "On Hold", value: "ON_HOLD" },
  { label: "Cancelled", value: "CANCELLED" }
] as const;

export const expenseCategoryOptions = [
  { label: "Hosting", value: "HOSTING" },
  { label: "Domain", value: "DOMAIN" },
  { label: "Marketing", value: "MARKETING" },
  { label: "Software", value: "SOFTWARE" },
  { label: "Salary", value: "SALARY" },
  { label: "Miscellaneous", value: "MISCELLANEOUS" }
] as const;

export const paymentModeOptions = [
  { label: "UPI", value: "UPI" },
  { label: "Bank Transfer", value: "BANK_TRANSFER" },
  { label: "Cash", value: "CASH" },
  { label: "Cheque", value: "CHEQUE" },
  { label: "PayPal", value: "PAYPAL" },
  { label: "Razorpay", value: "RAZORPAY" }
] as const;

export const partnerCodeOptions = ["Ashish", "Kush", "Ankit", "Mahrishi"] as const;
