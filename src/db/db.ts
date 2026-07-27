import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";
import { STUDENTS, FEE_TYPES, PAYMENTS, AUDIT_LOGS } from "../lib/mock-data";

const sqlite = new Database("sqlite.db");
export const db = drizzle(sqlite, { schema });

// Auto-seed function
export function seedDatabase() {
  try {
    // Check if seeding is already done by checking user count
    const userCount = db.select().from(schema.users).all().length;
    if (userCount > 0) {
      console.log("Database already seeded.");
      return;
    }

    console.log("Seeding database with default mock data...");

    // 1. Seed Users
    db.insert(schema.users).values([
      {
        id: "usr_admin",
        email: "admin@abcinternational.edu",
        password: "admin123",
        role: "admin",
      },
      {
        id: "usr_accountant",
        email: "accountant@abcinternational.edu",
        password: "accountant123",
        role: "accountant",
      },
      {
        id: "usr_parent",
        email: STUDENTS[0].email, // aarav.sharma@parent.abc.edu
        password: "parent123",
        role: "parent",
        studentId: STUDENTS[0].id,
      },
    ]).run();

    // 2. Seed Students
    db.insert(schema.students).values(
      STUDENTS.map(s => ({
        id: s.id,
        admissionNo: s.admissionNo,
        name: s.name,
        class: s.class,
        section: s.section,
        parentName: s.parentName,
        phone: s.phone,
        email: s.email,
        transport: s.transport,
        pending: s.pending,
        paid: s.paid,
      }))
    ).run();

    // 3. Seed Fee Types
    db.insert(schema.feeTypes).values(
      FEE_TYPES.map(f => ({
        id: f.id,
        name: f.name,
        description: f.description,
        amount: f.amount,
        dueDate: f.dueDate,
        classes: f.classes.join(","), // Store as comma-separated string
        recurring: f.recurring,
        lateFeePerDay: f.lateFeePerDay,
        active: f.active,
      }))
    ).run();

    // 4. Seed Payments
    db.insert(schema.payments).values(
      PAYMENTS.map(p => ({
        id: p.id,
        receiptNo: p.receiptNo,
        studentId: p.studentId,
        feeTypeId: p.feeTypeId,
        amount: p.amount,
        method: p.method,
        status: p.status,
        date: p.date,
        txnId: p.txnId,
        chequeNo: p.chequeNo,
        bank: p.bank,
        balance: p.balance,
      }))
    ).run();

    // 5. Seed Audit Logs
    db.insert(schema.auditLogs).values(
      AUDIT_LOGS.map(l => ({
        id: l.id,
        user: l.user,
        role: l.role,
        action: l.action,
        target: l.target,
        timestamp: l.timestamp,
      }))
    ).run();

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}
