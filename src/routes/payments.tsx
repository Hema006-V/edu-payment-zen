import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getPayments, getStudents, getFeeTypes, recordPayment } from "@/lib/server-functions";
import { inr, type Student, type FeeType, type Payment } from "@/lib/types";
import { QrCode, Banknote, Wallet, Plus, Receipt as ReceiptIcon } from "lucide-react";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/payments")({ component: PaymentsPage });

function PaymentsPage() {
  const [tab, setTab] = useState("all");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [feeTypes, setFeeTypes] = useState<FeeType[]>([]);

  const fetchAllData = () => {
    getPayments().then(setPayments);
    getStudents().then(setStudents);
    getFeeTypes().then(setFeeTypes);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const studentById = (id: string) => students.find(s => s.id === id) || { name: "Unknown", admissionNo: "", class: "", section: "" };
  const feeById = (id: string) => feeTypes.find(f => f.id === id) || { name: "Unknown", amount: 0 };

  const filtered = payments.filter(p => tab === "all" || p.method.toLowerCase() === tab);

  return (
    <div className="mx-auto max-w-[1400px] animate-fade-in">
      <PageHeader
        title="Payments"
        subtitle="Record and track UPI, cash, and cheque payments."
        actions={
          students.length > 0 && feeTypes.length > 0 ? (
            <RecordPaymentDialog students={students} feeTypes={feeTypes} onSave={fetchAllData} />
          ) : (
            <Button disabled>Record Payment (Add student & fee first)</Button>
          )
        }
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="glass">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="upi">UPI</TabsTrigger>
          <TabsTrigger value="cash">Cash</TabsTrigger>
          <TabsTrigger value="cheque">Cheque</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          <Card className="glass border-0">
            <CardContent className="overflow-x-auto p-0">
              {filtered.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  No payment records found.
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/30 text-xs uppercase text-muted-foreground">
                    <tr className="text-left">
                      <th className="px-4 py-3">Receipt</th>
                      <th className="px-4 py-3">Student</th>
                      <th className="px-4 py-3">Fee</th>
                      <th className="px-4 py-3">Method</th>
                      <th className="px-4 py-3">Ref</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Balance</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(p => {
                      const s = studentById(p.studentId);
                      const f = feeById(p.feeTypeId);
                      return (
                        <tr key={p.id} className="border-b border-border/60 hover:bg-muted/30">
                          <td className="px-4 py-3 font-mono text-xs">{p.receiptNo}</td>
                          <td className="px-4 py-3">
                            <div className="font-medium">{s.name}</div>
                            <div className="text-xs text-muted-foreground">Class {s.class}-{s.section}</div>
                          </td>
                          <td className="px-4 py-3">{f.name}</td>
                          <td className="px-4 py-3"><Badge variant="secondary">{p.method}</Badge></td>
                          <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                            {p.txnId ?? p.chequeNo ?? "—"}
                            {p.bank && <div className="text-[10px]">{p.bank}</div>}
                          </td>
                          <td className="px-4 py-3 font-semibold">{inr(p.amount)}</td>
                          <td className="px-4 py-3">{p.balance > 0 ? <span className="text-destructive">{inr(p.balance)}</span> : "—"}</td>
                          <td className="px-4 py-3"><StatusPill status={p.status} /></td>
                          <td className="px-4 py-3 text-muted-foreground">{format(new Date(p.date), "dd MMM yyyy")}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    Completed: "bg-[color:var(--success)]/15 text-[color:var(--success)]",
    Partial:   "bg-[color:var(--warning)]/25 text-[color:var(--warning-foreground)]",
    Pending:   "bg-[color:var(--info)]/20 text-[color:var(--info-foreground)]",
    Bounced:   "bg-destructive/15 text-destructive",
  };
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${map[status] ?? ""}`}>{status}</span>;
}

interface RecordPaymentProps {
  students: Student[];
  feeTypes: FeeType[];
  onSave: () => void;
}

function RecordPaymentDialog({ students, feeTypes, onSave }: RecordPaymentProps) {
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState<"UPI"|"Cash"|"Cheque">("UPI");
  const [studentId, setStudentId] = useState(students[0]?.id || "");
  const [feeTypeId, setFeeTypeId] = useState(feeTypes[0]?.id || "");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  // UPI fields
  const [txnId, setTxnId] = useState("");

  // Cheque fields
  const [chequeNo, setChequeNo] = useState("");
  const [bank, setBank] = useState("");

  useEffect(() => {
    if (feeTypeId) {
      const selectedFee = feeTypes.find(f => f.id === feeTypeId);
      if (selectedFee) {
        setAmount(String(selectedFee.amount));
      }
    }
  }, [feeTypeId, feeTypes]);

  const handleRecord = async () => {
    if (!studentId || !feeTypeId || !amount) {
      toast.error("Please fill in all details");
      return;
    }

    try {
      await recordPayment({
        studentId,
        feeTypeId,
        amount: Number(amount),
        method,
        date,
        txnId: method === "UPI" ? txnId : undefined,
        chequeNo: method === "Cheque" ? chequeNo : undefined,
        bank: method === "Cheque" ? bank : undefined,
      });

      toast.success("Payment recorded successfully");
      setOpen(false);
      setTxnId("");
      setChequeNo("");
      setBank("");
      onSave();
    } catch (err) {
      toast.error("Failed to record payment");
    }
  };

  const selectedFee = feeTypes.find(f => f.id === feeTypeId) || { amount: 0 };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="mr-2 h-4 w-4" /> Record Payment</Button>
      </DialogTrigger>
      <DialogContent className="glass border-0 sm:max-w-2xl">
        <DialogHeader><DialogTitle>Record Payment</DialogTitle></DialogHeader>

        <div className="grid grid-cols-3 gap-2">
          {(["UPI","Cash","Cheque"] as const).map(m => {
            const active = method === m;
            const Icon = m === "UPI" ? QrCode : m === "Cash" ? Banknote : Wallet;
            return (
              <button key={m} onClick={() => setMethod(m)}
                className={`rounded-xl border p-3 text-left transition ${active ? "border-primary bg-primary/10" : "border-border hover:bg-muted/40"}`}>
                <Icon className="mb-1 h-5 w-5 text-primary" />
                <div className="text-sm font-semibold">{m}</div>
                <div className="text-[11px] text-muted-foreground">
                  {m === "UPI" ? "QR / txn id" : m === "Cash" ? "Physical receipt" : "Cheque details"}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Student</Label>
            <Select value={studentId} onValueChange={setStudentId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {students.map(s => <SelectItem key={s.id} value={s.id}>{s.name} · {s.admissionNo}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Fee Structure</Label>
            <Select value={feeTypeId} onValueChange={setFeeTypeId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {feeTypes.map(f => <SelectItem key={f.id} value={f.id}>{f.name} — {inr(f.amount)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Amount (₹)</Label>
            <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} />
            <div className="mt-1 text-xs text-muted-foreground">Full amount: {inr(selectedFee.amount)}. Partial payments allowed.</div>
          </div>
          <div>
            <Label>Payment Date</Label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>

          {method === "UPI" && (
            <>
              <div className="sm:col-span-2 rounded-xl border bg-muted/40 p-4 text-center">
                <div className="mx-auto grid h-32 w-32 place-items-center rounded-xl bg-background">
                  <QrCode className="h-24 w-24 text-primary" />
                </div>
                <div className="mt-2 text-xs text-muted-foreground">Scan to pay via any UPI app · abcschool@upi</div>
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="txnid">UPI Transaction ID</Label>
                <Input id="txnid" value={txnId} onChange={e => setTxnId(e.target.value)} placeholder="e.g. UPI2026072112345" />
              </div>
            </>
          )}
          {method === "Cheque" && (
            <>
              <div>
                <Label htmlFor="chqno">Cheque Number</Label>
                <Input id="chqno" value={chequeNo} onChange={e => setChequeNo(e.target.value)} placeholder="CHQ200145" />
              </div>
              <div>
                <Label htmlFor="bank">Bank Name</Label>
                <Input id="bank" value={bank} onChange={e => setBank(e.target.value)} placeholder="HDFC Bank" />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleRecord}>
            <ReceiptIcon className="mr-2 h-4 w-4" /> Record & Generate Receipt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
