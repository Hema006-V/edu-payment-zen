import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { getAuditLogs } from "@/lib/server-functions";
import { formatDistanceToNow } from "date-fns";
import { Search } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import type { AuditLog } from "@/lib/types";

export const Route = createFileRoute("/audit")({ component: AuditPage });

function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [q, setQ] = useState("");
  const [role, setRole] = useState("all");
  const [action, setAction] = useState("all");

  useEffect(() => {
    getAuditLogs().then(setLogs);
  }, []);

  const actions = useMemo(() => Array.from(new Set(logs.map(l => l.action))), [logs]);

  const filtered = useMemo(() => logs.filter(l => {
    if (q && !(`${l.user} ${l.target}`.toLowerCase().includes(q.toLowerCase()))) return false;
    if (role !== "all" && l.role !== role) return false;
    if (action !== "all" && l.action !== action) return false;
    return true;
  }), [logs, q, role, action]);

  return (
    <div className="mx-auto max-w-[1400px] animate-fade-in">
      <PageHeader title="Audit Log" subtitle="Complete trail of every action taken in the system." />

      <Card className="glass mb-4 border-0">
        <CardContent className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search user or target…" className="pl-9" />
          </div>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger><SelectValue placeholder="Role" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="accountant">Accountant</SelectItem>
              <SelectItem value="parent">Parent</SelectItem>
            </SelectContent>
          </Select>
          <Select value={action} onValueChange={setAction}>
            <SelectTrigger><SelectValue placeholder="Action" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All actions</SelectItem>
              {actions.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="glass border-0">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">No logs found matching the filters.</div>
          ) : (
            <ul className="divide-y divide-border/60">
              {filtered.map(l => (
                <li key={l.id} className="flex items-center gap-4 px-4 py-3 hover:bg-muted/30">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                    {l.user.split(" ").map(x=>x[0]).join("")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{l.user}</span>
                      <Badge variant="secondary" className="capitalize">{l.role}</Badge>
                      <span className="text-sm text-muted-foreground">{l.action}</span>
                    </div>
                    <div className="mt-0.5 truncate text-xs text-muted-foreground">{l.target}</div>
                  </div>
                  <div className="whitespace-nowrap text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(l.timestamp), { addSuffix: true })}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
