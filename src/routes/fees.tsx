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
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getFeeTypes, addFeeType, deleteFeeType } from "@/lib/server-functions";
import { inr, CLASSES, type FeeType } from "@/lib/types";
import { Plus, Pencil, Trash2, CalendarClock, Repeat, Users2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/fees")({ component: FeesPage });

function FeesPage() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<FeeType[]>([]);

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [recurring, setRecurring] = useState<"one-time" | "monthly" | "quarterly" | "annual">("one-time");
  const [lateFee, setLateFee] = useState("");
  const [active, setActive] = useState(true);

  const fetchFees = () => {
    getFeeTypes().then(setItems);
  };

  useEffect(() => {
    fetchFees();
  }, []);

  const handleCreateFee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount || !dueDate) {
      toast.error("Please fill in name, amount, and due date");
      return;
    }

    try {
      await addFeeType({
        name,
        description,
        amount: Number(amount),
        dueDate,
        classes: ["all"],
        recurring,
        lateFeePerDay: Number(lateFee) || 0,
        active,
      });
      toast.success("Fee structure created successfully");
      setOpen(false);
      // Reset form
      setName("");
      setDescription("");
      setAmount("");
      setDueDate("");
      setRecurring("one-time");
      setLateFee("");
      setActive(true);
      fetchFees();
    } catch (err) {
      toast.error("Failed to create fee");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this fee structure?")) return;
    try {
      await deleteFeeType({ id });
      toast.success("Fee structure deleted");
      fetchFees();
    } catch (err) {
      toast.error("Failed to delete fee");
    }
  };

  return (
    <div className="mx-auto max-w-[1400px] animate-fade-in">
      <PageHeader
        title="Fee Structures"
        subtitle="Create and manage the fee structures applied across classes."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> Create Fee</Button>
            </DialogTrigger>
            <DialogContent className="glass border-0 sm:max-w-lg">
              <DialogHeader><DialogTitle>Create Fee Structure</DialogTitle></DialogHeader>
              <form onSubmit={handleCreateFee} className="space-y-3">
                <div>
                  <Label htmlFor="fee-name">Fee Name</Label>
                  <Input id="fee-name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Tuition Fee Q1" required />
                </div>
                <div>
                  <Label htmlFor="desc">Description</Label>
                  <Textarea id="desc" value={description} onChange={e => setDescription(e.target.value)} placeholder="Short description…" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="amount">Amount (₹)</Label>
                    <Input id="amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" required />
                  </div>
                  <div>
                    <Label htmlFor="due">Due Date</Label>
                    <Input id="due" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Recurrence</Label>
                    <Select value={recurring} onValueChange={(v: any) => setRecurring(v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="one-time">One-time</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="annual">Annual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="late-fee">Late fee / day (₹)</Label>
                    <Input id="late-fee" type="number" value={lateFee} onChange={e => setLateFee(e.target.value)} placeholder="0" />
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-muted/50 p-3">
                  <div>
                    <div className="text-sm font-medium">Active</div>
                    <div className="text-xs text-muted-foreground">Fee structure is active and visible.</div>
                  </div>
                  <Switch checked={active} onCheckedChange={setActive} />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button type="submit">Create</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {items.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center text-muted-foreground">
          No fee structures configured. Click 'Create Fee' to add the first one.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map(fee => (
            <Card key={fee.id} className="glass border-0">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-display text-lg font-semibold">{fee.name}</div>
                    <div className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{fee.description || "No description provided."}</div>
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
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(fee.id)}>
                    <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
