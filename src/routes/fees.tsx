import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { FEE_TYPES, inr } from "@/lib/mock-data";
import { Plus, Pencil, Trash2, CalendarClock, Repeat, Users2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const dummy = "src/components/ui/textarea";

export const Route = createFileRoute("/fees")({ component: FeesPage });

function FeesPage() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(FEE_TYPES);

  return (
    <div className="mx-auto max-w-[1400px] animate-fade-in">
      <PageHeader
        title="Fee Types"
        subtitle="Create and manage the fee structure applied across classes."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> Create Fee</Button>
            </DialogTrigger>
            <DialogContent className="glass border-0 sm:max-w-lg">
              <DialogHeader><DialogTitle>Create Fee</DialogTitle></DialogHeader>
              <div className="grid gap-3">
                <div><Label>Fee Name</Label><Input placeholder="e.g. Library Fee" /></div>
                <div><Label>Description</Label><Textarea placeholder="Short description…" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Amount (₹)</Label><Input type="number" placeholder="0" /></div>
                  <div><Label>Due Date</Label><Input type="date" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Recurrence</Label>
                    <Select defaultValue="one-time">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="one-time">One-time</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="annual">Annual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Late fee / day (₹)</Label><Input type="number" placeholder="0" /></div>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-muted/50 p-3">
                  <div><div className="text-sm font-medium">Active</div><div className="text-xs text-muted-foreground">Fee is applied to eligible students.</div></div>
                  <Switch defaultChecked />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={() => { setOpen(false); toast.success("Fee created (prototype)"); }}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map(fee => (
          <Card key={fee.id} className="glass border-0">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-display text-lg font-semibold">{fee.name}</div>
                  <div className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{fee.description}</div>
                </div>
                <Badge variant={fee.active ? "secondary" : "outline"} className={fee.active ? "bg-[color:var(--success)]/15 text-[color:var(--success)]" : ""}>
                  {fee.active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="mt-4 font-display text-2xl font-bold text-gradient">{inr(fee.amount)}</div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5"><CalendarClock className="h-3 w-3" /> Due {fee.dueDate}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5"><Repeat className="h-3 w-3" /> {fee.recurring}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5"><Users2 className="h-3 w-3" /> {fee.classes[0] === "all" ? "All classes" : `Class ${fee.classes.join(", ")}`}</span>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <Button size="sm" variant="outline" onClick={() => toast.info("Edit flow (prototype)")}><Pencil className="mr-1 h-3.5 w-3.5" /> Edit</Button>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => { setItems(items.filter(f => f.id !== fee.id)); toast.success("Fee removed"); }}>
                  <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

void dummy;
