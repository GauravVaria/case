// src/types/case.ts

export interface Installment {
  id: string; // Unique ID for each installment
  invoiceNumber: string; // Alphanumeric
  invoiceDate: string; // YYYY-MM-DD format
  amount: number; // Amount for this installment
  paymentMethod: 'cash' | 'upi' | 'other' | string; // 'other' for custom input
  dateReceived: string; // Date when payment was received (YYYY-MM-DD)
}

export interface Hearing {
  id: string; // Unique ID for each hearing
  date: string; // Date of the hearing (YYYY-MM-DD)
  remark: string; // Remark/details for this specific hearing
  feesCharged: number; // The per hearing fee amount charged for this hearing
}

// NEW INTERFACE for CourtVisit
export interface CourtVisit {
  id: string; // Unique ID for each court visit
  date: string; // Date of the court visit (YYYY-MM-DD)
  remark: string; // Remark/details for this specific court visit
}

export interface Case {
  id: string; // Unique ID for each case
  caseTitle: string; // "A vs B" or Client Name
  caseNumber: string; // Legal Notice, Affidavit, or Custom
  court: 'High Court' | 'None' | string; // High Court, None, or Custom
  appearingFor: string; // "A" or "B" or Custom
  quotation: number; // Total amount quoted
  perHearingFees?: number; // Optional per hearing fees (if > 0, counter displays)
  invoiceNumber: string; // Initial invoice number
  invoiceDate: string; // Initial invoice date
  invoiceAmount: number; // Initial invoice amount
  installments: Installment[]; // Array of payment installments
  hearings: Hearing[]; // Array of hearings
  courtVisits: CourtVisit[]; // NEW: Array of court visits
  balanceRemaining: number; // This will be *calculated*
  remark: string; // Any remarks (general case remarks)
  reference: string; // Reference information
  tdsApplicable: boolean; // Yes/No for TDS
  dateCreated: string; // Date the case was created (YYYY-MM-DD)
}