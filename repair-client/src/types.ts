// D:\Projects\1. Website\1.Code\6. REPAIR\repair-client\src\types.ts
export type Status = "pending" | "repaired";
export type Severity = "normal" | "urgent" | "critical";

export type Theme = "light" | "dark" | "system";
export type Currency = "TOMAN" | "USD" | "EUR";
export type Palette = "ink" | "prism" | "sunset";

export interface Part {
  id?: number;

  receivedDate: string;         // ISO YYYY-MM-DD (تاریخ دریافت)
  completedDate?: string;       // ISO YYYY-MM-DD (پایان تعمیر)
  deliveredDate?: string;       // ISO YYYY-MM-DD (تحویل به مشتری)

  partName: string;
  customerName: string;
  faultDesc?: string;
  technicianName: string;

  techPrice: number;
  myMarginPct: number;
  companyMarginPct: number;
  myPrice: number;
  companyPrice: number;

  status: Status;
  settled: boolean;
  severity: Severity;

  serial?: string;
  invoiceNo?: string;
  tags?: string[];
  estimateDays?: number | null;
  warranty?: boolean;

  notes?: string;
  updatedAt: string;
}

export interface Settings {
  id: number;
  defaultMyMarginPct: number;
  defaultCompanyMarginPct: number;
  defaultTechnicianName: string;
  theme: Theme;
  currency: Currency;
  palette?: Palette; // theme-ink|theme-prism|theme-sunset
}

export interface Attachment {
  id?: number;
  partId: number;
  name: string;
  type: string;
  size: number;
  createdAt: string;
}
