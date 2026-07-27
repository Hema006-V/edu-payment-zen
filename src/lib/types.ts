// Client-safe types, constants, and formatting helpers.
// This file is safe to import on both the client (browser) and the server (Node.js).

export type Role = "admin" | "accountant" | "parent";

export type User = {
  id: string;
  email: string;
  password: string;
  name: string;
  role: Role;
};

export type Student = {
  id: string;
  admissionNo: string;
  name: string;
  class: string;
  section: string;
  parentName: string;
  phone: string;
  email: string;
  transport: boolean;
  pending: number;
  paid: number;
};

export type FeeType = {
  id: string;
  name: string;
  description: string;
  amount: number;
  dueDate: string;
  classes: string[];
  recurring: "one-time" | "monthly" | "quarterly" | "annual";
  lateFeePerDay: number;
  active: boolean;
};

export type PaymentMethod = "UPI" | "Cash" | "Cheque";
export type PaymentStatus = "Completed" | "Pending" | "Bounced" | "Partial";

export type Payment = {
  id: string;
  receiptNo: string;
  studentId: string;
  feeTypeId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  date: string;
  txnId?: string;
  chequeNo?: string;
  bank?: string;
  balance: number;
};

export type AuditLog = {
  id: string;
  user: string;
  role: Role;
  action: string;
  target: string;
  timestamp: string;
};

export type ReminderTemplate = {
  id: string;
  name: string;
  channel: string;
  body: string;
};

export type School = {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
};

export type Database = {
  users: User[];
  students: Student[];
  feeTypes: FeeType[];
  payments: Payment[];
  auditLogs: AuditLog[];
  reminderTemplates: ReminderTemplate[];
  school: School;
};

export const CLASSES = ["Nursery","LKG","UKG","1","2","3","4","5","6","7","8","9","10","11","12"];
export const SECTIONS = ["A","B","C","D"];

export function inr(n: number): string {
  return "₹" + n.toLocaleString("en-IN");
}
