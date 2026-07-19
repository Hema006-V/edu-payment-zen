import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MONTHLY_REVENUE, FEE_TYPE_COLLECTION, METHOD_BREAKDOWN, PAYMENTS, STUDENTS, inr } from "@/lib/mock-data";
import { FileSpreadsheet, FileDown, CalendarDays, ClipboardList, PieChart as PieIcon, Users, Building } from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";
import { toast } from "sonner";

export const Route = createFileRoute("/reports")({ component: ReportsPage });

const CHART_COLORS = ["var(--chart-1)","var(--chart-2)","var(--chart-3)","var(--chart-4)","var(--chart-5)"];

function ReportsPage() {
  const cards = [
    { icon: CalendarDays, title: "Daily Collection", desc: "Today's payments across methods", value: inr(84500) },
    { icon: CalendarDays, title: "Monthly Collection", desc: "Current month cumulative", value: inr(1_180_000) },
    { icon: ClipboardList, title: "Pending Fees", desc: `Across ${STUDENTS.filter(s=>s.pending>0).length} students`, value: inr(STUDENTS.reduce((s,x)=>s+x.pending,0)) },
    { icon: Users, title: "Student-wise", desc: "Per-student ledger", value: `${STUDENTS.length} students` },
    { icon: Building, title: "Class-wise", desc: "Class-by-class summary", value: "15 classes" },
    { icon: PieIcon, title: "Payment Method", desc: "UPI vs Cash vs Cheque", value: "58 / 22 / 20" },
  ];

  return (
    <div className="mx-auto max-w-[1400px] animate-fade-in">
      <PageHeader
        title="Reports"
        subtitle="Financial reports, exports, and revenue summaries."
        actions={
          <>
            <Button variant="outline" className="glass-soft" onClick={() => toast.success("CSV exported (prototype)")}>
              <FileDown className="mr-2 h-4 w-4" /> Export CSV
            </Button>
            <Button onClick={() => toast.success("Excel exported (prototype)")}>
              <FileSpreadsheet className="mr-2 h-4 w-4" /> Export Excel
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(c => (
          <Card key={c.title} className="glass border-0 transition hover:-translate-y-0.5">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/40 text-primary"><c.icon className="h-5 w-5" /></div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">{c.title}</div>
                  <div className="text-xs text-muted-foreground">{c.desc}</div>
                </div>
              </div>
              <div className="mt-4 flex items-end justify-between">
                <div className="text-xl font-bold text-gradient">{c.value}</div>
                <Button size="sm" variant="outline" onClick={() => toast.success(`Generated: ${c.title}`)}>Generate</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="glass border-0 lg:col-span-2">
          <CardHeader><CardTitle className="font-display">Revenue Summary</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={MONTHLY_REVENUE}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => v >= 100000 ? `${(v/100000).toFixed(1)}L` : v.toString()} />
                <Tooltip formatter={(v: number) => inr(v)} contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Line type="monotone" dataKey="revenue" stroke="var(--chart-1)" strokeWidth={3} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="pending" stroke="var(--chart-4)" strokeWidth={2} strokeDasharray="4 4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass border-0">
          <CardHeader><CardTitle className="font-display">Method Split</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={METHOD_BREAKDOWN} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={4}>
                  {METHOD_BREAKDOWN.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} />)}
                </Pie>
                <Legend />
                <Tooltip formatter={(v: number) => `${v}%`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass border-0 lg:col-span-3">
          <CardHeader><CardTitle className="font-display">Fee-Type Breakdown</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={FEE_TYPE_COLLECTION}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => v >= 100000 ? `${(v/100000).toFixed(1)}L` : v.toString()} />
                <Tooltip formatter={(v: number) => inr(v)} contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Legend />
                <Bar dataKey="collected" radius={[8,8,0,0]} fill="var(--chart-1)" />
                <Bar dataKey="pending"   radius={[8,8,0,0]} fill="var(--chart-4)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="mt-2 text-xs text-muted-foreground">
        {PAYMENTS.length} transactions available for export. <Badge variant="secondary">CSV</Badge> <Badge variant="secondary">Excel</Badge>
      </div>
    </div>
  );
}
