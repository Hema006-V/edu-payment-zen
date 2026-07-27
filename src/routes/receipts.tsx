import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { getPayments, getStudents, getFeeTypes, getSchool } from "@/lib/server-functions";
import { inr, type Student, type FeeType, type Payment } from "@/lib/types";
import { format } from "date-fns";
import { Download, Search, FileText, QrCode, Printer } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/receipts")({ component: ReceiptsPage });

function ReceiptsPage() {
  const [q, setQ] = useState("");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [feeTypes, setFeeTypes] = useState<FeeType[]>([]);
  const [school, setSchool] = useState<any>({ name: "ABC International School" });

  useEffect(() => {
    getPayments().then(setPayments);
    getStudents().then(setStudents);
    getFeeTypes().then(setFeeTypes);
    getSchool().then(setSchool);
  }, []);

  const studentById = (id: string) => students.find(s => s.id === id) || { name: "Unknown", admissionNo: "", class: "", section: "", parentName: "", phone: "" };
  const feeById = (id: string) => feeTypes.find(f => f.id === id) || { name: "Unknown" };

  const list = payments.filter(p => p.status !== "Bounced").filter(p => {
    if (!q) return true;
    const s = studentById(p.studentId);
    return p.receiptNo.toLowerCase().includes(q.toLowerCase()) || s.name.toLowerCase().includes(q.toLowerCase());
  });

  return (
    <div className="mx-auto max-w-[1400px] animate-fade-in">
      <PageHeader title="Receipts" subtitle={`${list.length} receipts generated`} />

      <div className="glass mb-4 flex items-center gap-3 rounded-2xl p-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by receipt number or student…" className="border-0 bg-transparent pl-9 shadow-none focus-visible:ring-0" />
        </div>
      </div>

      {list.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center text-muted-foreground">
          No receipts found.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {list.map(p => {
            const s = studentById(p.studentId);
            const f = feeById(p.feeTypeId);
            return (
              <Card key={p.id} className="glass group border-0 transition hover:-translate-y-0.5">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/15 text-primary"><FileText className="h-4 w-4" /></div>
                      <div>
                        <div className="font-mono text-xs font-semibold">{p.receiptNo}</div>
                        <div className="text-[10px] text-muted-foreground">{format(new Date(p.date), "dd MMM yyyy")}</div>
                      </div>
                    </div>
                    <Badge variant="secondary">{p.method}</Badge>
                  </div>
                  <div className="mt-3">
                    <div className="text-sm font-semibold">{s.name}</div>
                    <div className="text-xs text-muted-foreground">{f.name} · Class {s.class}-{s.section}</div>
                  </div>
                  <div className="mt-3 flex items-center justify-between rounded-xl bg-muted/50 p-3">
                    <div className="text-lg font-bold text-gradient">{inr(p.amount)}</div>
                    <ReceiptDialog payment={p} student={s} fee={f} school={school} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface ReceiptDialogProps {
  payment: Payment;
  student: any;
  fee: any;
  school: any;
}

function ReceiptDialog({ payment, student, fee, school }: ReceiptDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="glass-soft">View</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>Payment Receipt</DialogTitle></DialogHeader>
        <div className="rounded-2xl border bg-gradient-to-br from-background to-muted/40 p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="font-display text-lg font-bold text-gradient">{school.name}</div>
              <div className="text-[11px] text-muted-foreground">{school.address}</div>
              <div className="text-[11px] text-muted-foreground">{school.phone} · {school.email}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase text-muted-foreground">Receipt</div>
              <div className="font-mono text-sm font-semibold">{payment.receiptNo}</div>
              <div className="text-[10px] text-muted-foreground">{format(new Date(payment.date), "dd MMM yyyy, HH:mm")}</div>
            </div>
          </div>
          <div className="my-4 h-px bg-border" />
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-[10px] uppercase text-muted-foreground">Student</div>
              <div className="font-medium">{student.name}</div>
              <div className="text-xs text-muted-foreground">Class {student.class}-{student.section} · {student.admissionNo}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-muted-foreground">Parent</div>
              <div className="font-medium">{student.parentName}</div>
              <div className="text-xs text-muted-foreground">{student.phone}</div>
            </div>
          </div>
          <div className="mt-4 rounded-xl border">
            <div className="flex items-center justify-between px-3 py-2 text-xs uppercase text-muted-foreground">
              <span>Fee</span><span>Amount</span>
            </div>
            <div className="flex items-center justify-between border-t px-3 py-2">
              <span className="text-sm">{fee.name}</span>
              <span className="text-sm font-medium">{inr(payment.amount)}</span>
            </div>
            <div className="flex items-center justify-between border-t px-3 py-2">
              <span className="text-xs text-muted-foreground">Method: {payment.method}{payment.txnId ? ` · ${payment.txnId}` : payment.chequeNo ? ` · ${payment.chequeNo} (${payment.bank})` : ""}</span>
              <span className="text-xs text-muted-foreground">Balance: {inr(payment.balance)}</span>
            </div>
            <div className="flex items-center justify-between border-t bg-muted/40 px-3 py-2">
              <span className="text-sm font-semibold">Total Paid</span>
              <span className="text-lg font-bold text-gradient">{inr(payment.amount)}</span>
            </div>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div className="text-[11px] text-muted-foreground">This is a computer-generated receipt.</div>
            <div className="grid place-items-center rounded-lg border bg-background p-2">
              <QrCode className="h-14 w-14 text-primary" />
              <div className="mt-1 text-[9px] text-muted-foreground">Verify</div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => toast.success("Sent to printer (prototype)")}><Printer className="mr-2 h-4 w-4" /> Print</Button>
          <Button onClick={() => toast.success("PDF downloaded (prototype)")}><Download className="mr-2 h-4 w-4" /> Download PDF</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
