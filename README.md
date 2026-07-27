# ABC International School — Fee Management System

A full-stack fee management system built with a **Bun** runtime, **Drizzle ORM**, and a **SQLite** database. Includes Admin, Accountant, and Parent portals with live dashboards, payment tracking, receipts, reminders, and audit logs.

---

## Getting Started

### Prerequisites
- [Bun](https://bun.sh) installed (`curl -fsSL https://bun.sh/install | bash`)
- Node.js (if any tooling requires it — check `AGENTS.md` for specifics)

### 1. Clone the repo
```bash
git clone https://github.com/Hema006-V/edu-payment-zen
cd papbud
```

### 2. Install dependencies
```bash
bun install
```

### 3. Set up environment variables
Copy the example env file and fill in any required values (DB path, secrets, etc.):
```bash
cp .env.example .env
```

### 4. Set up the database
Run migrations to create the SQLite schema via Drizzle:
```bash
bun run db:migrate
```
> If you have a seed script for demo data, run it too, e.g. `bun run db:seed`. Check `package.json` scripts for the exact command name.

### 5. Start the dev server
```bash
bun run dev
```
The app should now be running locally (check terminal output for the port/URL).

---

## Demo Login Credentials

| Role | Email | Password |
|---|---|---|
|  Admin | `admin@abcinternational.edu` | `admin123` |
|  Accountant | `accountant@abcinternational.edu` | `accountant123` |
|  Parent | `aarav.sharma@parent.abc.edu` | `parent123` |

The `/login` page also has **Quick Demo** buttons for one-click login as each role.

---

## Feature Overview

| Page | Functionality |
|---|---|
| **Auth & Role Guards** | Session cookie + localStorage fallback. Auto-redirects Admin/Accountant to `/`, Parents to `/parent`. |
| **Dashboard** (`/`) | Revenue, pending fees, defaulters, and today's collection stat cards. Monthly revenue trend, payment method split, and fee-type collection charts. Live defaulters list & recent transactions. |
| **Students** (`/students`) | Add students (name, admission no, class, section, parent info, transport). Filter by class/section/search/payment status. |
| **Fee Structure** (`/fees`) | Create/delete fee structures (amount, due date, recurrence, late fee). Active/Inactive status badges. |
| **Payments** (`/payments`) | Record payments via UPI, Cash, or Cheque. Auto-updates student balances. Generates receipt numbers (`RCPT-2026-xxxxxx`). Logs to audit trail. |
| **Receipts** (`/receipts`) | Searchable receipt list with printable PDF view, school branding, and QR verification. |
| **Reminders** (`/reminders`) | Auto-lists defaulters. Editable templates for due/overdue/confirmation messages. Queue via WhatsApp/SMS, logged to audit trail. |
| **Audit Logs** (`/audit`) | Full activity trail, filterable by role and action type. |
| **Parent Portal** (`/parent`) | Student profile, fee payment progress bar, upcoming dues, payment history with receipt downloads. |

---

## Testing the Full Flow

1. Make sure the server is running: `bun run dev`
2. **Login as Admin** — `admin@abcinternational.edu` / `admin123`
3. Go to **Fee Structures** (`/fees`) and create a fee.
4. Go to **Students** (`/students`) and add a new student.
5. Go to **Payments** (`/payments`) → **Record Payment** → pick student & fee → submit.
6. Check the **Dashboard** and **Audit Logs** — stats, charts, balances, and audit entries update live from the SQLite database.

---
## Note

These are **demo credentials** for local development/testing only.
