import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { StatCard } from "@/components/stat-card";
import {
  CURRENT_PARENT_STUDENT_ID, PAYMENTS, FEE_TYPES, studentById, feeById, inr,
} from "@/lib/mock-data";
import { format, differenceInDays } from "date-fns";
import { IndianRupee, AlertTriangle, CheckCircle2, Download, CalendarClock, GraduationCap } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/parent")({ component: ParentPortal });

function ParentPortal() {
  const student = studentById(CURRENT_PARENT_STUDENT_ID);
  const myPayments = PAYMENTS.filter(p => p.studentId === student.id);
  const totalPaid = myPayments.reduce((s, p) => s + p.amount, 0);
  const pending = student.pending;
  const upcoming = FEE_TYPES.filter(f => f.active).slice(0, 4).map(f => ({
    ...f, daysLeft: differenceInDays(new Date(f.dueDate), new Date()),
  }));

  const total = totalPaid + pending;
  const pct = total ? Math.round((totalPaid / total) * 100) : 100;

  return (
    <div className="mx-auto max-w-[1200px] animate-fade-in">
      <PageHeader
        title={`Welcome, ${student.parentName}`}
        subtitle={`${student.name} · Class ${student.class}-${student.section} · ${student.admissionNo}`}
        actions={
          <Button className="shadow-[var(--shadow-soft)]" onClick={() => toast.success("Redirecting to payment (prototype)")}>
            <IndianRupee className="mr-2 h-4 w-4" /> Pay Now
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Paid" value={inr(totalPaid)} icon={CheckCircle2} tone="success" hint="this academic year" />
        <StatCard label="Pending Dues" value={inr(pending)} icon={AlertTriangle} tone="warning" hint={pending ? "action required" : "all clear"} />
        <StatCard label="Next Due" value={upcoming[0] ? format(new Date(upcoming[0].dueDate), "dd MMM") : "—"} icon={CalendarClock} tone="info" hint={upcoming[0]?.name} />
      </div>

      <Card className="glass mt-6 border-0">
        <CardHeader><CardTitle className="font-display">Yearly Progress</CardTitle></CardHeader>
        <CardContent>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium">{inr(totalPaid)} paid of {inr(total)}</span>
            <span className="text-muted-foreground">{pct}%</span>
          </div>
          <Progress value={pct} />
        </CardContent>
      </Card>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="glass border-0">
          <CardHeader><CardTitle className="font-display">Fee Structure</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {FEE_TYPES.filter(f => f.active).slice(0, 6).map(f => (
              <div key={f.id} className="flex items-center justify-between rounded-xl border p-3">
                <div>
                  <div className="text-sm font-medium">{f.name}</div>
                  <div className="text-xs text-muted-foreground">{f.recurring} · due {format(new Date(f.dueDate), "dd MMM")}</div>
                </div>
                <div className="text-sm font-semibold">{inr(f.amount)}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="glass border-0">
          <CardHeader><CardTitle className="font-display">Upcoming Due Dates</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {upcoming.map(f => {
              const overdue = f.daysLeft < 0;
              return (
                <div key={f.id} className="flex items-center justify-between rounded-xl border p-3">
                  <div className="flex items-center gap-3">
                    <div className={`grid h-9 w-9 place-items-center rounded-lg ${overdue ? "bg-destructive/15 text-destructive" : "bg-primary/15 text-primary"}`}>
                      <CalendarClock className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{f.name}</div>
                      <div className="text-xs text-muted-foreground">{overdue ? `Overdue by ${Math.abs(f.daysLeft)}d` : `Due in ${f.daysLeft}d`} · {inr(f.amount)}</div>
                    </div>
                  </div>
                  <Badge variant={overdue ? "destructive" : "secondary"}>{overdue ? "Overdue" : "Upcoming"}</Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <Card className="glass mt-6 border-0">
        <CardHeader><CardTitle className="font-display">Payment History</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-muted-foreground">
              <tr className="text-left">
                <th className="py-2 pr-4">Receipt</th>
                <th className="py-2 pr-4">Fee</th>
                <th className="py-2 pr-4">Method</th>
                <th className="py-2 pr-4">Amount</th>
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4"></th>
              </tr>
            </thead>
            <tbody>
              {myPayments.length === 0 && (
                <tr><td colSpan={6} className="py-6 text-center text-muted-foreground">No payments yet.</td></tr>
              )}
              {myPayments.map(p => {
                const f = feeById(p.feeTypeId);
                return (
                  <tr key={p.id} className="border-t border-border/60 hover:bg-muted/30">
                    <td className="py-2 pr-4 font-mono text-xs">{p.receiptNo}</td>
                    <td className="py-2 pr-4">{f.name}</td>
                    <td className="py-2 pr-4"><Badge variant="secondary">{p.method}</Badge></td>
                    <td className="py-2 pr-4 font-semibold">{inr(p.amount)}</td>
                    <td className="py-2 pr-4 text-muted-foreground">{format(new Date(p.date), "dd MMM yyyy")}</td>
                    <td className="py-2 pr-4 text-right">
                      <Button size="sm" variant="outline" className="glass-soft" onClick={() => toast.success("Receipt downloaded (prototype)")}>
                        <Download className="mr-1 h-3.5 w-3.5" /> Receipt
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="mt-6 text-center text-xs text-muted-foreground">
        <GraduationCap className="mx-auto mb-1 h-4 w-4" /> ABC International School Parent Portal
      </div>
    </div>
  );
}
