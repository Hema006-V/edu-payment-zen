import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(), // 'admin' | 'accountant' | 'parent'
  studentId: text("student_id"), // Linked student for parent role
});

export const students = sqliteTable("students", {
  id: text("id").primaryKey(),
  admissionNo: text("admission_no").notNull().unique(),
  name: text("name").notNull(),
  class: text("class").notNull(),
  section: text("section").notNull(),
  parentName: text("parent_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  transport: integer("transport", { mode: "boolean" }).notNull().default(false),
  pending: integer("pending").notNull().default(0),
  paid: integer("paid").notNull().default(0),
});

export const feeTypes = sqliteTable("fee_types", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  amount: integer("amount").notNull(),
  dueDate: text("due_date").notNull(),
  classes: text("classes").notNull(), // Comma-separated or JSON string of eligible classes
  recurring: text("recurring").notNull(), // 'one-time' | 'monthly' | 'quarterly' | 'annual'
  lateFeePerDay: integer("late_fee_per_day").notNull().default(0),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
});

export const payments = sqliteTable("payments", {
  id: text("id").primaryKey(),
  receiptNo: text("receipt_no").notNull().unique(),
  studentId: text("student_id").notNull(),
  feeTypeId: text("fee_type_id").notNull(),
  amount: integer("amount").notNull(),
  method: text("method").notNull(), // 'UPI' | 'Cash' | 'Cheque'
  status: text("status").notNull(), // 'Completed' | 'Pending' | 'Bounced' | 'Partial'
  date: text("date").notNull(),
  txnId: text("txn_id"),
  chequeNo: text("cheque_no"),
  bank: text("bank"),
  balance: integer("balance").notNull().default(0),
});

export const auditLogs = sqliteTable("audit_logs", {
  id: text("id").primaryKey(),
  user: text("user").notNull(),
  role: text("role").notNull(),
  action: text("action").notNull(),
  target: text("target").notNull(),
  timestamp: text("timestamp").notNull(),
});
