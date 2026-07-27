import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { getStudents, getReminderTemplates, sendReminderFn } from "@/lib/server-functions";
import { inr, type Student, type ReminderTemplate } from "@/lib/types";
import { MessageCircle, Smartphone, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/reminders")({ component: RemindersPage });

function RemindersPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [templates, setTemplates] = useState<ReminderTemplate[]>([]);
  const [activeTemplate, setActiveTemplate] = useState<ReminderTemplate | null>(null);
  const [body, setBody] = useState("");

  useEffect(() => {
    getStudents().then(setStudents);
    getReminderTemplates().then(tmps => {
      setTemplates(tmps);
      if (tmps.length > 0) {
        setActiveTemplate(tmps[0]);
        setBody(tmps[0].body);
      }
    });
  }, []);

  const defaulters = students.filter(s => s.pending > 0);
  const toggle = (id: string) => setSelected(sel => sel.includes(id) ? sel.filter(x => x !== id) : [...sel, id]);

  const selectTemplate = (t: ReminderTemplate) => {
    setActiveTemplate(t);
    setBody(t.body);
  };

  return (
    <div className="mx-auto max-w-[1400px] animate-fade-in">
      <PageHeader title="Reminders" subtitle="Nudge parents via WhatsApp or SMS with editable templates." />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="glass border-0 lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="font-display">Recipients (Students with Overdue Fees)</CardTitle>
            <Badge variant="secondary" className="gap-1"><Users className="h-3 w-3" /> {selected.length} selected</Badge>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {defaulters.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                No students currently have pending dues.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-xs uppercase text-muted-foreground">
                  <tr className="text-left">
                    <th className="w-10"></th>
                    <th className="py-2 pr-4">Student</th>
                    <th className="py-2 pr-4">Parent</th>
                    <th className="py-2 pr-4">Phone</th>
                    <th className="py-2 pr-4">Pending</th>
                  </tr>
                </thead>
                <tbody>
                  {defaulters.map(s => (
                    <tr key={s.id} className="border-t border-border/60 hover:bg-muted/30">
                      <td className="py-2 pl-1"><Checkbox checked={selected.includes(s.id)} onCheckedChange={() => toggle(s.id)} /></td>
                      <td className="py-2 pr-4">
                        <div className="font-medium">{s.name}</div>
                        <div className="text-xs text-muted-foreground">Class {s.class}-{s.section}</div>
                      </td>
                      <td className="py-2 pr-4">{s.parentName}</td>
                      <td className="py-2 pr-4 font-mono text-xs">{s.phone}</td>
                      <td className="py-2 pr-4 font-semibold text-destructive">{inr(s.pending)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        <Card className="glass border-0">
          <CardHeader><CardTitle className="font-display">Message Template</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {templates.map(t => (
                <button key={t.id}
                  onClick={() => selectTemplate(t)}
                  className={`rounded-full border px-3 py-1 text-xs ${activeTemplate?.id === t.id ? "border-primary bg-primary/10 text-primary" : "hover:bg-muted/40"}`}>
                  {t.name}
                </button>
              ))}
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Preview / Edit</label>
              <Textarea rows={8} value={body} onChange={e => setBody(e.target.value)} />
              <div className="mt-1 text-[11px] text-muted-foreground">Variables: {"{parent} {student} {class} {feeName} {amount} {dueDate} {receiptNo}"}</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                className="bg-[#25D366] hover:bg-[#22c05f] text-white"
                disabled={defaulters.length === 0}
                onClick={async () => {
                  const targetIds = selected.length ? selected : defaulters.map(d => d.id);
                  await sendReminderFn({ data: { studentIds: targetIds, message: body, channel: "WhatsApp" } });
                  toast.success(`WhatsApp reminder sent to ${targetIds.length} parents`, { description: "Logged in audit trail." });
                }}
              >
                <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
              </Button>
              <Button
                variant="outline"
                disabled={defaulters.length === 0}
                onClick={async () => {
                  const targetIds = selected.length ? selected : defaulters.map(d => d.id);
                  await sendReminderFn({ data: { studentIds: targetIds, message: body, channel: "SMS" } });
                  toast.success(`SMS reminder queued for ${targetIds.length} parents`, { description: "Logged in audit trail." });
                }}
              >
                <Smartphone className="mr-2 h-4 w-4" /> SMS
              </Button>
            </div>
            <div className="rounded-xl bg-muted/50 p-3 text-[11px] text-muted-foreground">
              Prototype: reminders are simulated — no external API is called.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
