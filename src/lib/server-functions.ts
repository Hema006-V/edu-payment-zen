// Unified server functions — all routes import from here.
// Backed by SQLite via Drizzle ORM (our backend) with the same API
// that Samyuktha's route files expect.

import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie, deleteCookie } from "vinxi/http";
import { db } from "../db/db";
import * as schema from "../db/schema";
import { eq, desc } from "drizzle-orm";
import type {
  Student, FeeType, Payment, AuditLog, PaymentMethod, PaymentStatus, Role,
} from "./types";

export * from "./types";

// ─── ID Generator ─────────────────────────────────────────────────────────────
let counter = Date.now();
function genId(prefix: string): string {
  return `${prefix}_${++counter}`;
}

// ─── School ──────────────────────────────────────────────────────────────────
export const getSchool = createServerFn({ method: "GET" }).handler(async () => ({
  name: "ABC International School",
  tagline: "Excellence in Education",
  address: "12 Learning Avenue, New Delhi 110001",
  phone: "+91 98765 43210",
  email: "accounts@abcinternational.edu",
}));

// ─── Auth ────────────────────────────────────────────────────────────────────
export const loginFn = createServerFn({ method: "POST" })
  .validator((data: { email: string; password: string }) => data)
  .handler(async ({ data }) => {
    const user = db.select().from(schema.users).where(eq(schema.users.email, data.email)).get();
    if (!user || user.password !== data.password) {
      return { success: false as const, error: "Invalid email or password" };
    }
    setCookie("session_user_id", user.id, { path: "/", maxAge: 60 * 60 * 24, httpOnly: true, sameSite: "strict" });
    return {
      success: true as const,
      user: { id: user.id, email: user.email, name: user.email.split("@")[0], role: user.role as Role },
    };
  });

export const logoutFn = createServerFn({ method: "POST" })
  .handler(async () => {
    deleteCookie("session_user_id", { path: "/" });
    return { success: true };
  });

export const getCurrentUserFn = createServerFn({ method: "GET" })
  .handler(async () => {
    const userId = getCookie("session_user_id");
    if (!userId) return null;
    const user = db.select().from(schema.users).where(eq(schema.users.id, userId)).get();
    if (!user) return null;
    return { id: user.id, email: user.email, name: user.email.split("@")[0], role: user.role as Role, studentId: user.studentId };
  });

// ─── Students ────────────────────────────────────────────────────────────────
export const getStudents = createServerFn({ method: "GET" }).handler(async () => {
  return db.select().from(schema.students).all() as Student[];
});

export const addStudent = createServerFn({ method: "POST" })
  .validator((data: Omit<Student, "id" | "pending" | "paid">) => data)
  .handler(async ({ data }) => {
    const student = { ...data, id: genId("stu"), pending: 0, paid: 0 };
    db.insert(schema.students).values(student).run();
    return student as Student;
  });

// ─── Fee Types ───────────────────────────────────────────────────────────────
export const getFeeTypes = createServerFn({ method: "GET" }).handler(async () => {
  const list = db.select().from(schema.feeTypes).all();
  return list.map(f => ({ ...f, classes: f.classes.split(",") })) as FeeType[];
});

export const addFeeType = createServerFn({ method: "POST" })
  .validator((data: Omit<FeeType, "id">) => data)
  .handler(async ({ data }) => {
    const fee = { ...data, id: genId("fee"), classes: data.classes.join(",") };
    db.insert(schema.feeTypes).values(fee).run();
    return { ...fee, classes: data.classes } as FeeType;
  });

export const deleteFeeType = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    db.delete(schema.feeTypes).where(eq(schema.feeTypes.id, data.id)).run();
    return { success: true };
  });

// ─── Payments ────────────────────────────────────────────────────────────────
export const getPayments = createServerFn({ method: "GET" }).handler(async () => {
  return db.select().from(schema.payments).orderBy(desc(schema.payments.date)).all() as Payment[];
});

export const recordPayment = createServerFn({ method: "POST" })
  .validator((data: {
    studentId: string; feeTypeId: string; amount: number; method: PaymentMethod;
    date: string; txnId?: string; chequeNo?: string; bank?: string;
  }) => data)
  .handler(async ({ data }) => {
    const feeRow = db.select().from(schema.feeTypes).where(eq(schema.feeTypes.id, data.feeTypeId)).get();
    const feeAmount = feeRow?.amount ?? data.amount;
    const status: PaymentStatus = data.amount >= feeAmount ? "Completed" : "Partial";
    const balance = Math.max(0, feeAmount - data.amount);

    const payment = {
      id: genId("pay"),
      receiptNo: `RCPT-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`,
      studentId: data.studentId,
      feeTypeId: data.feeTypeId,
      amount: data.amount,
      method: data.method,
      status,
      date: data.date || new Date().toISOString(),
      txnId: data.txnId,
      chequeNo: data.chequeNo,
      bank: data.bank,
      balance,
    };

    db.insert(schema.payments).values(payment).run();

    // Update student paid/pending
    const student = db.select().from(schema.students).where(eq(schema.students.id, data.studentId)).get();
    if (student) {
      db.update(schema.students).set({
        paid: student.paid + data.amount,
        pending: Math.max(0, student.pending - data.amount),
      }).where(eq(schema.students.id, data.studentId)).run();
    }

    // Add audit log
    db.insert(schema.auditLogs).values({
      id: genId("log"),
      user: "System",
      role: "admin",
      action: "Payment Recorded",
      target: `${student?.name ?? data.studentId} · ${feeRow?.name ?? data.feeTypeId}`,
      timestamp: new Date().toISOString(),
    }).run();

    return payment as Payment;
  });

// ─── Audit Logs ──────────────────────────────────────────────────────────────
export const getAuditLogs = createServerFn({ method: "GET" }).handler(async () => {
  return db.select().from(schema.auditLogs).orderBy(desc(schema.auditLogs.timestamp)).all() as AuditLog[];
});

export const addAuditLog = createServerFn({ method: "POST" })
  .validator((data: { user: string; role: Role; action: string; target: string }) => data)
  .handler(async ({ data }) => {
    const log = { ...data, id: genId("log"), timestamp: new Date().toISOString() };
    db.insert(schema.auditLogs).values(log).run();
    return log as AuditLog;
  });

// ─── Reminder Templates ──────────────────────────────────────────────────────
export const getReminderTemplates = createServerFn({ method: "GET" }).handler(async () => {
  // Simulated — no DB table, returns fixed templates
  return [
    { id: "t1", name: "Upcoming Due", channel: "WhatsApp",
      body: "Dear {parent}, this is a friendly reminder that {feeName} of ₹{amount} for {student} ({class}) is due on {dueDate}. — ABC International School" },
    { id: "t2", name: "Overdue", channel: "SMS",
      body: "Dear {parent}, {feeName} of ₹{amount} for {student} is overdue since {dueDate}. Please pay to avoid late fees. — ABC" },
    { id: "t3", name: "Payment Confirmation", channel: "WhatsApp",
      body: "Payment of ₹{amount} received for {student}. Receipt {receiptNo}. Thank you! — ABC International School" },
    { id: "t4", name: "Receipt Sent", channel: "SMS",
      body: "Receipt {receiptNo} for {student} has been emailed. — ABC International School" },
  ];
});

// ─── Send Reminder (Simulated) ───────────────────────────────────────────────
export const sendReminderFn = createServerFn({ method: "POST" })
  .validator((data: { studentIds: string[]; message: string; channel: string }) => data)
  .handler(async ({ data }) => {
    // Log the simulated reminder to audit log
    db.insert(schema.auditLogs).values({
      id: genId("log"),
      user: "System",
      role: "admin",
      action: "Reminder Sent",
      target: `${data.studentIds.length} recipients via ${data.channel}`,
      timestamp: new Date().toISOString(),
    }).run();
    return { success: true, sent: data.studentIds.length };
  });

// ─── Dashboard Stats ─────────────────────────────────────────────────────────
export const getDashboardStats = createServerFn({ method: "GET" }).handler(async () => {
  const allPayments = db.select().from(schema.payments).all();
  const allStudents = db.select().from(schema.students).all();
  const allFeeTypes = db.select().from(schema.feeTypes).all();

  const totalRevenue = allPayments
    .filter(p => p.status === "Completed" || p.status === "Partial")
    .reduce((s, p) => s + p.amount, 0);
  const pendingTotal = allStudents.reduce((s, x) => s + x.pending, 0);
  const withPending = allStudents.filter(s => s.pending > 0).length;
  const today = new Date().toDateString();
  const todaysCollection = allPayments
    .filter(p => new Date(p.date).toDateString() === today)
    .reduce((s, p) => s + p.amount, 0);

  const defaulters = [...allStudents]
    .filter(s => s.pending > 0)
    .sort((a, b) => b.pending - a.pending)
    .slice(0, 6);

  const recent = [...allPayments]
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .slice(0, 6);

  const methodCounts: Record<string, number> = {};
  allPayments.forEach(p => { methodCounts[p.method] = (methodCounts[p.method] || 0) + 1; });
  const totalPayments = allPayments.length || 1;
  const methodBreakdown = Object.entries(methodCounts).map(([name, count]) => ({
    name, value: Math.round((count / totalPayments) * 100),
  }));

  const feeTypeCollection = allFeeTypes.map(f => {
    const paymentsForFee = allPayments.filter(p => p.feeTypeId === f.id);
    const collected = paymentsForFee
      .filter(p => p.status === "Completed" || p.status === "Partial")
      .reduce((s, p) => s + p.amount, 0);
    const pending = paymentsForFee
      .filter(p => p.status === "Pending")
      .reduce((s, p) => s + p.balance, 0);
    return { name: f.name.replace(" Fee", ""), collected, pending };
  });

  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const monthlyMap: Record<string, { revenue: number; pending: number }> = {};
  monthNames.forEach(m => { monthlyMap[m] = { revenue: 0, pending: 0 }; });
  allPayments.forEach(p => {
    const month = monthNames[new Date(p.date).getMonth()];
    if (p.status === "Completed" || p.status === "Partial") monthlyMap[month].revenue += p.amount;
    if (p.status === "Pending") monthlyMap[month].pending += p.balance;
  });
  const monthlyRevenue = monthNames.map(month => ({ month, ...monthlyMap[month] }));

  return {
    totalRevenue, pendingTotal, withPending, todaysCollection,
    totalStudents: allStudents.length,
    totalPaymentsCount: allPayments.length,
    defaulters, recent, methodBreakdown, feeTypeCollection, monthlyRevenue,
  };
});

// ─── Parent Portal Data ───────────────────────────────────────────────────────
export const getParentPortalData = createServerFn({ method: "GET" }).handler(async () => {
  const userId = getCookie("session_user_id");
  if (!userId) throw new Error("Unauthorized");
  const user = db.select().from(schema.users).where(eq(schema.users.id, userId)).get();
  if (!user?.studentId) throw new Error("Parent record not found");
  const student = db.select().from(schema.students).where(eq(schema.students.id, user.studentId)).get();
  if (!student) throw new Error("Student profile not found");
  const myPayments = db.select().from(schema.payments)
    .where(eq(schema.payments.studentId, student.id))
    .orderBy(desc(schema.payments.date)).all();
  const feeTypes = db.select().from(schema.feeTypes).all().map(f => ({ ...f, classes: f.classes.split(",") }));
  return { student, myPayments, feeTypes };
});
