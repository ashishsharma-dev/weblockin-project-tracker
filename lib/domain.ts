export const roles = {
  ADMIN: "ADMIN",
  PARTNER: "PARTNER"
} as const;

export const contributionTypes = {
  LEAD: "LEAD",
  DEVELOPMENT: "DEVELOPMENT"
} as const;

export const partnerCodes = {
  Ashish: "Ashish",
  Kush: "Kush",
  Ankit: "Ankit",
  Mahrishi: "Mahrishi"
} as const;

export const projectStatuses = {
  LEAD_RECEIVED: "LEAD_RECEIVED",
  PROPOSAL_SENT: "PROPOSAL_SENT",
  NEGOTIATION: "NEGOTIATION",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  ON_HOLD: "ON_HOLD",
  CANCELLED: "CANCELLED"
} as const;

export const expenseCategories = {
  HOSTING: "HOSTING",
  DOMAIN: "DOMAIN",
  MARKETING: "MARKETING",
  SOFTWARE: "SOFTWARE",
  SALARY: "SALARY",
  MISCELLANEOUS: "MISCELLANEOUS"
} as const;

export const paymentModes = {
  UPI: "UPI",
  BANK_TRANSFER: "BANK_TRANSFER",
  CASH: "CASH",
  CHEQUE: "CHEQUE",
  PAYPAL: "PAYPAL",
  RAZORPAY: "RAZORPAY"
} as const;
