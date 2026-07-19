import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { REMINDER_TEMPLATES, STUDENTS, inr } from "@/lib/mock-data";
import { MessageCircle, Smartphone, Send, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/reminders")({ component: RemindersPage });

function RemindersPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [template, setTemplate] = useState(REMINDER_TEMPLATES[0]);
  const [body, setBody] = useState(REMINDER_TEMPLATES[0].body);

  const defaulters = STUDENTS.filter(s => s.pending > 0).slice(0, 12);
  const toggle = (id: string) => setSelected(sel => sel.includes(id) ? sel.filter(x => x !== id) : [...sel, id]);

  return (
    <div className="mx-auto max-w-[1400px] animate-fade-in">
      <PageHeader title="Reminders" subtitle="Nudge parents via WhatsApp or SMS with editable templates." />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="glass border-0 lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="font-display">Recipients</CardTitle>
            <Badge variant="secondary" className="gap-1"><Users className="h-3 w-3" /> {selected.length} selected</Badge>
          </CardHeader>
          <CardContent className="overflow-x-auto">
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
          </CardContent>
        </Card>

        <Card className="glass border-0">
          <CardHeader><CardTitle className="font-display">Message</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {REMINDER_TEMPLATES.map(t => (
                <button key={t.id}
                  onClick={() => { setTemplate(t); setBody(t.body); }}
                  className={`rounded-full border px-3 py-1 text-xs ${template.id === t.id ? "border-primary bg-primary/10 text-primary" : "hover:bg-muted/40"}`}>
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
              <Button className="bg-[#25D366] hover:bg-[#22c05f] text-white" onClick={() => toast.success(`WhatsApp sent to ${selected.length || defaulters.length} parents (prototype)`)}>
                <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
              </Button>
              <Button variant="outline" onClick={() => toast.success(`SMS queued for ${selected.length || defaulters.length} parents (prototype)`)}>
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

void Input; void Send;
