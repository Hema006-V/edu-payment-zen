// Mock data powering the School Fee Management prototype (UI-only).
export type Role = "admin" | "accountant" | "parent";

export const SCHOOL = {
  name: "ABC International School",
  tagline: "Excellence in Education",
  address: "12 Learning Avenue, New Delhi 110001",
  phone: "+91 98765 43210",
  email: "accounts@abcinternational.edu",
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
  avatar?: string;
  pending: number;
  paid: number;
};

export const CLASSES = ["Nursery","LKG","UKG","1","2","3","4","5","6","7","8","9","10","11","12"];
export const SECTIONS = ["A","B","C","D"];

const firstNames = ["Aarav","Vivaan","Aditya","Vihaan","Arjun","Sai","Reyansh","Ayaan","Krishna","Ishaan","Ananya","Aadhya","Diya","Saanvi","Myra","Aarohi","Anika","Navya","Kiara","Pari","Rohan","Kabir","Advait","Neha","Riya","Zara","Ira","Meera","Kavya","Aanya"];
const lastNames = ["Sharma","Verma","Gupta","Iyer","Nair","Reddy","Patel","Khan","Singh","Mehta","Kapoor","Chopra","Bose","Das","Menon"];

function seeded(i: number) {
  return (Math.sin(i * 9973) + 1) / 2;
}

export const STUDENTS: Student[] = Array.from({ length: 42 }).map((_, i) => {
  const first = firstNames[i % firstNames.length];
  const last = lastNames[(i * 3) % lastNames.length];
  const cls = CLASSES[(i * 5) % CLASSES.length];
  const sec = SECTIONS[i % SECTIONS.length];
  const pending = Math.round(seeded(i + 1) * 45000);
  const paid = 30000 + Math.round(seeded(i + 7) * 60000);
  return {
    id: `stu_${1000 + i}`,
    admissionNo: `ABC${2024}${String(1000 + i)}`,
    name: `${first} ${last}`,
    class: cls,
    section: sec,
    parentName: `${["Mr.","Mrs."][i % 2]} ${last}`,
    phone: `+91 9${String(800000000 + i * 137).slice(0,9)}`,
    email: `${first.toLowerCase()}.${last.toLowerCase()}@parent.abc.edu`,
    transport: i % 3 === 0,
    pending: i % 4 === 0 ? 0 : pending,
    paid,
  };
});

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

export const FEE_TYPES: FeeType[] = [
  { id: "fee_tuition", name: "Tuition Fee", description: "Standard quarterly tuition", amount: 22000, dueDate: "2026-07-31", classes: ["all"], recurring: "quarterly", lateFeePerDay: 50, active: true },
  { id: "fee_transport", name: "Transport Fee", description: "School bus, all routes", amount: 6500, dueDate: "2026-07-15", classes: ["all"], recurring: "monthly", lateFeePerDay: 20, active: true },
  { id: "fee_hostel", name: "Hostel Fee", description: "Boarding, class 6+", amount: 45000, dueDate: "2026-08-10", classes: ["6","7","8","9","10","11","12"], recurring: "quarterly", lateFeePerDay: 100, active: true },
  { id: "fee_exam", name: "Examination Fee", description: "Term examination", amount: 1800, dueDate: "2026-09-01", classes: ["all"], recurring: "one-time", lateFeePerDay: 25, active: true },
  { id: "fee_annual", name: "Annual Fee", description: "Yearly building & maintenance", amount: 12000, dueDate: "2026-04-15", classes: ["all"], recurring: "annual", lateFeePerDay: 40, active: true },
  { id: "fee_library_fine", name: "Library Fine", description: "Overdue book fine", amount: 200, dueDate: "2026-07-25", classes: ["all"], recurring: "one-time", lateFeePerDay: 5, active: true },
  { id: "fee_late", name: "Late Fee", description: "Late payment penalty", amount: 500, dueDate: "2026-07-20", classes: ["all"], recurring: "one-time", lateFeePerDay: 0, active: true },
  { id: "fee_sports", name: "Sports Fee", description: "Sports facility & equipment", amount: 3500, dueDate: "2026-08-05", classes: ["all"], recurring: "annual", lateFeePerDay: 15, active: true },
  { id: "fee_computer", name: "Computer Lab Fee", description: "Lab access & software", amount: 2800, dueDate: "2026-08-20", classes: ["3","4","5","6","7","8","9","10","11","12"], recurring: "annual", lateFeePerDay: 15, active: true },
  { id: "fee_activity", name: "Activity Fee", description: "Extracurriculars & events", amount: 1500, dueDate: "2026-09-15", classes: ["all"], recurring: "annual", lateFeePerDay: 10, active: false },
];

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

const methods: PaymentMethod[] = ["UPI","Cash","Cheque"];
const statuses: PaymentStatus[] = ["Completed","Completed","Completed","Pending","Partial","Bounced"];

export const PAYMENTS: Payment[] = Array.from({ length: 60 }).map((_, i) => {
  const stu = STUDENTS[i % STUDENTS.length];
  const fee = FEE_TYPES[i % FEE_TYPES.length];
  const method = methods[i % methods.length];
  const status = i < 6 ? statuses[i] : statuses[Math.floor(seeded(i+11)*statuses.length)];
  const amount = fee.amount - Math.round(seeded(i+3) * (status === "Partial" ? fee.amount * 0.6 : 0));
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(seeded(i+5) * 90));
  return {
    id: `pay_${5000+i}`,
    receiptNo: `RCPT-${2026}-${String(5000+i)}`,
    studentId: stu.id,
    feeTypeId: fee.id,
    amount,
    method,
    status,
    date: d.toISOString(),
    txnId: method === "UPI" ? `UPI${Math.floor(seeded(i+13)*1e10).toString().padStart(10,"0")}` : undefined,
    chequeNo: method === "Cheque" ? `CHQ${String(200000+i)}` : undefined,
    bank: method === "Cheque" ? ["HDFC","ICICI","SBI","Axis"][i%4] : undefined,
    balance: status === "Partial" ? fee.amount - amount : 0,
  };
});

// Monthly trend
export const MONTHLY_REVENUE = [
  { month: "Feb", revenue: 480000, pending: 120000 },
  { month: "Mar", revenue: 620000, pending: 95000 },
  { month: "Apr", revenue: 890000, pending: 145000 },
  { month: "May", revenue: 720000, pending: 110000 },
  { month: "Jun", revenue: 940000, pending: 160000 },
  { month: "Jul", revenue: 1120000, pending: 210000 },
  { month: "Aug", revenue: 980000, pending: 175000 },
  { month: "Sep", revenue: 860000, pending: 140000 },
  { month: "Oct", revenue: 790000, pending: 125000 },
  { month: "Nov", revenue: 910000, pending: 155000 },
  { month: "Dec", revenue: 1040000, pending: 190000 },
  { month: "Jan", revenue: 1180000, pending: 205000 },
];

export const METHOD_BREAKDOWN = [
  { name: "UPI", value: 58 },
  { name: "Cash", value: 22 },
  { name: "Cheque", value: 20 },
];

export const FEE_TYPE_COLLECTION = FEE_TYPES.slice(0,7).map((f, i) => ({
  name: f.name.replace(" Fee",""),
  collected: 120000 + Math.round(seeded(i+2) * 500000),
  pending: 15000 + Math.round(seeded(i+4) * 90000),
}));

export type AuditLog = {
  id: string;
  user: string;
  role: Role;
  action: string;
  target: string;
  timestamp: string;
};

const actions = [
  "Fee Created","Fee Edited","Fee Deleted","Payment Recorded","Waiver Applied","Reminder Sent","Receipt Generated","Cheque Marked Bounced","Scholarship Applied","Report Exported"
];

export const AUDIT_LOGS: AuditLog[] = Array.from({ length: 40 }).map((_, i) => {
  const d = new Date();
  d.setHours(d.getHours() - i * 5);
  const role: Role = i % 5 === 0 ? "accountant" : "admin";
  return {
    id: `log_${i}`,
    user: role === "admin" ? "Priya Menon" : "Rahul Verma",
    role,
    action: actions[i % actions.length],
    target: `${STUDENTS[i % STUDENTS.length].name} · ${FEE_TYPES[i % FEE_TYPES.length].name}`,
    timestamp: d.toISOString(),
  };
});

export const NOTIFICATIONS = [
  { id: "n1", kind: "payment", title: "New payment received", desc: "₹22,000 from Aarav Sharma (Tuition Fee)", time: "2 min ago" },
  { id: "n2", kind: "overdue", title: "5 fees overdue today", desc: "Transport fee for Class 6-A pending", time: "1 hr ago" },
  { id: "n3", kind: "bounce", title: "Cheque bounced", desc: "CHQ200034 · HDFC · ₹12,000", time: "3 hr ago" },
  { id: "n4", kind: "upcoming", title: "Due dates approaching", desc: "18 students have dues in 3 days", time: "Today" },
  { id: "n5", kind: "change", title: "Fee structure updated", desc: "Sports Fee amount changed to ₹3,500", time: "Yesterday" },
];

export const REMINDER_TEMPLATES = [
  { id: "t1", name: "Upcoming Due", channel: "WhatsApp",
    body: "Dear {parent}, this is a friendly reminder that {feeName} of ₹{amount} for {student} ({class}) is due on {dueDate}. — ABC International School" },
  { id: "t2", name: "Overdue", channel: "SMS",
    body: "Dear {parent}, {feeName} of ₹{amount} for {student} is overdue since {dueDate}. Please pay to avoid late fees. — ABC" },
  { id: "t3", name: "Payment Confirmation", channel: "WhatsApp",
    body: "Payment of ₹{amount} received for {student}. Receipt {receiptNo}. Thank you! — ABC International School" },
  { id: "t4", name: "Receipt Sent", channel: "SMS",
    body: "Receipt {receiptNo} for {student} has been emailed. — ABC International School" },
];

export const CURRENT_PARENT_STUDENT_ID = STUDENTS[0].id;

export function studentById(id: string) {
  return STUDENTS.find(s => s.id === id)!;
}
export function feeById(id: string) {
  return FEE_TYPES.find(f => f.id === id)!;
}

export function inr(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}
