import { StatCard } from "@/components/stat-card";
import { PageHeader } from "@/components/page-header";
import {
  IndianRupee, AlertTriangle, Users, TrendingUp, Plus, Send, Download,
  BadgePlus, Banknote, FileSpreadsheet, ScrollText, Receipt as Receipt2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from "recharts";
import { getDashboardStats, getFeeTypes, getStudents } from "@/lib/server-functions";
import { inr } from "@/lib/types";
import { format } from "date-fns";
import { toast } from "sonner";
import { Link, useNavigate, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({ component: Dashboard });

const CHART_COLORS = ["var(--chart-1)","var(--chart-2)","var(--chart-3)","var(--chart-4)","var(--chart-5)"];

type DashboardData = Awaited<ReturnType<typeof getDashboardStats>>;

function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [feeTypes, setFeeTypes] = useState<Awaited<ReturnType<typeof getFeeTypes>>>([]);

  useEffect(() => {
    getDashboardStats().then(setData);
    getFeeTypes().then(setFeeTypes);
  }, []);

  if (!data) {
    return (
      <div className="mx-auto max-w-[1400px] animate-fade-in">
        <PageHeader title="Dashboard" subtitle="Loading…" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1,2,3,4].map(i => (
            <Card key={i} className="glass border-0 h-28 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const q = (action: string) => () => toast.success(action, { description: "Action recorded." });

  const feeById = (id: string) => feeTypes.find(f => f.id === id);
  const studentById = (id: string) => {
    const s = data.defaulters.find(s => s.id === id);
    return s || { name: "Unknown", admissionNo: "", class: "", section: "" };
  };

  return (
    <div className="mx-auto max-w-[1400px] animate-fade-in">
      <PageHeader
        title="Dashboard"
        subtitle="Live overview of fee collections, dues, and activity."
        actions={
          <>
            <Button variant="outline" className="glass-soft" asChild>
              <Link to="/reminders">
                <Send className="mr-2 h-4 w-4" /> Send Reminder
              </Link>
            </Button>
            <Button className="shadow-[var(--shadow-soft)]" asChild>
              <Link to="/reports">
                <Download className="mr-2 h-4 w-4" /> Generate Report
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Revenue" value={inr(data.totalRevenue)} hint="all time" icon={IndianRupee} tone="primary" />
        <StatCard label="Pending Fees" value={inr(data.pendingTotal)} hint="across all classes" icon={AlertTriangle} tone="warning" />
        <StatCard label="Students w/ Dues" value={String(data.withPending)} hint={`of ${data.totalStudents} total`} icon={Users} tone="info" />
        <StatCard label="Today's Collection" value={inr(data.todaysCollection)} hint={`${data.totalPaymentsCount} transactions`} icon={TrendingUp} tone="success" />
      </div>

      {/* Quick actions */}
      <div className="mt-6">
        <div className="mb-3 text-sm font-semibold text-muted-foreground">Quick actions</div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
          {[
            { icon: BadgePlus, label: "Create Fee", to: "/fees" },
            { icon: Users, label: "Assign Fee", to: "/fees" },
            { icon: Banknote, label: "Cash Payment", to: "/payments" },
            { icon: Receipt2 as any, label: "Cheque Payment", to: "/payments" },
            { icon: FileSpreadsheet, label: "Reports", to: "/reports" },
            { icon: Download, label: "Export", to: "/reports" },
            { icon: Send, label: "Reminder", to: "/reminders" },
          ].map((a, i) => (
            <Link to={a.to} key={i} className="glass hover:-translate-y-0.5 transition group rounded-2xl p-4 text-center">
              <div className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/40 text-primary group-hover:scale-110 transition">
                <a.icon className="h-5 w-5" />
              </div>
              <div className="mt-2 text-xs font-medium">{a.label}</div>
            </Link>
          ))}
        </div>
      </div>

      {data.totalStudents === 0 && data.totalPaymentsCount === 0 ? (
        <Card className="glass mt-6 border-0">
          <CardContent className="p-12 text-center">
            <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Users className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold">Welcome to your dashboard!</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Start by adding students and fee types. Once you record payments, your charts and stats will appear here.
            </p>
            <div className="mt-4 flex justify-center gap-3">
              <Button asChild><Link to="/students"><Plus className="mr-2 h-4 w-4" /> Add Students</Link></Button>
              <Button variant="outline" asChild><Link to="/fees"><BadgePlus className="mr-2 h-4 w-4" /> Create Fees</Link></Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="glass col-span-2 border-0">
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="font-display">Monthly Revenue Trend</CardTitle>
                <Badge variant="secondary">Last 12 months</Badge>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={data.monthlyRevenue}>
                    <defs>
                      <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.6}/>
                        <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02}/>
                      </linearGradient>
                      <linearGradient id="pend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--chart-4)" stopOpacity={0.5}/>
                        <stop offset="100%" stopColor="var(--chart-4)" stopOpacity={0.02}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} axisLine={false} tickLine={false}
                      tickFormatter={(v) => v >= 100000 ? `${(v/100000).toFixed(1)}L` : v.toString()} />
                    <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 }} formatter={(v: number) => inr(v)} />
                    <Area type="monotone" dataKey="revenue" stroke="var(--chart-1)" strokeWidth={2.5} fill="url(#rev)" />
                    <Area type="monotone" dataKey="pending" stroke="var(--chart-4)" strokeWidth={2} fill="url(#pend)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="glass border-0">
              <CardHeader><CardTitle className="font-display">Payment Method</CardTitle></CardHeader>
              <CardContent>
                {data.methodBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={data.methodBreakdown} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={4}>
                        {data.methodBreakdown.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Pie>
                      <Legend />
                      <Tooltip formatter={(v: number) => `${v}%`} contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="grid h-[280px] place-items-center text-sm text-muted-foreground">No payment data yet</div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="glass col-span-2 border-0">
              <CardHeader><CardTitle className="font-display">Collection by Fee Type</CardTitle></CardHeader>
              <CardContent>
                {data.feeTypeCollection.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.feeTypeCollection}>
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
                ) : (
                  <div className="grid h-[300px] place-items-center text-sm text-muted-foreground">No fee data yet</div>
                )}
              </CardContent>
            </Card>

            <Card className="glass border-0">
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="font-display">Top Defaulters</CardTitle>
                <Badge variant="destructive">{data.defaulters.length}</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.defaulters.length === 0 && (
                  <div className="py-6 text-center text-sm text-muted-foreground">No defaulters — great job!</div>
                )}
                {data.defaulters.map(s => (
                  <div key={s.id} className="flex items-center gap-3 rounded-xl p-2 hover:bg-muted/40">
                    <Avatar className="h-9 w-9"><AvatarFallback className="bg-accent/60 text-accent-foreground">{s.name.split(" ").map(x => x[0]).join("").slice(0,2)}</AvatarFallback></Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{s.name}</div>
                      <div className="truncate text-xs text-muted-foreground">Class {s.class}-{s.section} · {s.admissionNo}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-destructive">{inr(s.pending)}</div>
                      <div className="text-[10px] text-muted-foreground">overdue</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card className="glass mt-6 border-0">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="font-display">Recent Transactions</CardTitle>
              <Button variant="ghost" size="sm" asChild><Link to="/payments">View all</Link></Button>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {data.recent.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">No transactions yet.</div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase text-muted-foreground">
                      <th className="py-2 pr-4">Receipt</th>
                      <th className="py-2 pr-4">Amount</th>
                      <th className="py-2 pr-4">Method</th>
                      <th className="py-2 pr-4">Status</th>
                      <th className="py-2 pr-4">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recent.map(p => (
                      <tr key={p.id} className="border-t border-border/60 hover:bg-muted/30">
                        <td className="py-2.5 pr-4 font-mono text-xs">{p.receiptNo}</td>
                        <td className="py-2.5 pr-4 font-semibold">{inr(p.amount)}</td>
                        <td className="py-2.5 pr-4"><Badge variant="secondary">{p.method}</Badge></td>
                        <td className="py-2.5 pr-4"><StatusBadge status={p.status} /></td>
                        <td className="py-2.5 pr-4 text-muted-foreground">{format(new Date(p.date), "dd MMM, HH:mm")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Completed: "bg-[color:var(--success)]/15 text-[color:var(--success)]",
    Partial:   "bg-[color:var(--warning)]/25 text-[color:var(--warning-foreground)]",
    Pending:   "bg-[color:var(--info)]/20 text-[color:var(--info-foreground)]",
    Bounced:   "bg-destructive/15 text-destructive",
  };
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${map[status] ?? ""}`}>{status}</span>;
}


