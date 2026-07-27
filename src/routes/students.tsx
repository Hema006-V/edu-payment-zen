import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Search, Plus, Bus, Phone, Mail, Download } from "lucide-react";
import { getStudents, addStudent } from "@/lib/server-functions";
import { CLASSES, SECTIONS, inr, type Student } from "@/lib/types";
import { useMemo, useState, useEffect } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/students")({ component: StudentsPage });

function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [q, setQ] = useState("");
  const [cls, setCls] = useState<string>("all");
  const [sec, setSec] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [open, setOpen] = useState(false);

  // New Student form fields
  const [name, setName] = useState("");
  const [admissionNo, setAdmissionNo] = useState("");
  const [selectedClass, setSelectedClass] = useState("1");
  const [selectedSection, setSelectedSection] = useState("A");
  const [parentName, setParentName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [transport, setTransport] = useState(false);

  const fetchStudents = () => {
    getStudents().then(setStudents);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !admissionNo || !parentName || !phone || !email) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      await addStudent({
        name,
        admissionNo,
        class: selectedClass,
        section: selectedSection,
        parentName,
        phone,
        email,
        transport,
      });
      toast.success("Student added successfully");
      setOpen(false);
      // Reset form
      setName("");
      setAdmissionNo("");
      setParentName("");
      setPhone("");
      setEmail("");
      setTransport(false);
      fetchStudents();
    } catch (err) {
      toast.error("Failed to add student");
    }
  };

  const filtered = useMemo(() => students.filter(s => {
    if (q && !(s.name.toLowerCase().includes(q.toLowerCase()) || s.admissionNo.toLowerCase().includes(q.toLowerCase()))) return false;
    if (cls !== "all" && s.class !== cls) return false;
    if (sec !== "all" && s.section !== sec) return false;
    if (status === "paid" && s.pending > 0) return false;
    if (status === "pending" && s.pending === 0) return false;
    return true;
  }), [students, q, cls, sec, status]);

  return (
    <div className="mx-auto max-w-[1400px] animate-fade-in">
      <PageHeader
        title="Students"
        subtitle={`${filtered.length} of ${students.length} students`}
        actions={
          <>
            <Button variant="outline" className="glass-soft" onClick={() => toast.success("CSV exported (prototype)")}>
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Add Student
                </Button>
              </DialogTrigger>
              <DialogContent className="glass border-0 sm:max-w-lg">
                <DialogHeader><DialogTitle>Add Student</DialogTitle></DialogHeader>
                <form onSubmit={handleAddStudent} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Rahul Sharma" required />
                    </div>
                    <div>
                      <Label htmlFor="admissionNo">Admission No.</Label>
                      <Input id="admissionNo" value={admissionNo} onChange={e => setAdmissionNo(e.target.value)} placeholder="e.g. ABC20261001" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Class</Label>
                      <Select value={selectedClass} onValueChange={setSelectedClass}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {CLASSES.map(c => <SelectItem key={c} value={c}>Class {c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Section</Label>
                      <Select value={selectedSection} onValueChange={setSelectedSection}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {SECTIONS.map(s => <SelectItem key={s} value={s}>Section {s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="my-2 h-px bg-border" />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="parentName">Parent Name</Label>
                      <Input id="parentName" value={parentName} onChange={e => setParentName(e.target.value)} placeholder="e.g. Mr. Sharma" required />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. +91 9876543210" required />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="e.g. parent@example.com" required />
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-muted/50 p-3">
                    <div>
                      <div className="text-sm font-medium">School Bus Transport</div>
                      <div className="text-xs text-muted-foreground">Check if student uses school bus.</div>
                    </div>
                    <Switch checked={transport} onCheckedChange={setTransport} />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button type="submit">Save Student</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </>
        }
      />

      <Card className="glass mb-4 border-0">
        <CardContent className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by name or admission no…" className="pl-9" />
          </div>
          <Select value={cls} onValueChange={setCls}>
            <SelectTrigger><SelectValue placeholder="Class" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All classes</SelectItem>
              {CLASSES.map(c => <SelectItem key={c} value={c}>Class {c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={sec} onValueChange={setSec}>
            <SelectTrigger><SelectValue placeholder="Section" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sections</SelectItem>
              {SECTIONS.map(s => <SelectItem key={s} value={s}>Section {s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger><SelectValue placeholder="Payment status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="paid">Fully Paid</SelectItem>
              <SelectItem value="pending">Has Pending</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center text-muted-foreground">
          {students.length === 0 ? "No students in the database yet. Click 'Add Student' to get started." : "No students match the current filters."}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map(s => (
            <Card key={s.id} className="glass border-0 transition hover:-translate-y-0.5">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-gradient-to-br from-primary/30 to-accent/60 text-primary-foreground">
                      {s.name.split(" ").map(x=>x[0]).join("").slice(0,2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="truncate font-semibold">{s.name}</div>
                      {s.transport && <Badge variant="secondary" className="gap-1"><Bus className="h-3 w-3" /> Bus</Badge>}
                    </div>
                    <div className="text-xs text-muted-foreground">Class {s.class}-{s.section} · {s.admissionNo}</div>
                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{s.phone}</span>
                      <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" />{s.email}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between rounded-xl bg-muted/50 p-3">
                  <div>
                    <div className="text-[10px] uppercase text-muted-foreground">Paid</div>
                    <div className="text-sm font-semibold">{inr(s.paid)}</div>
                  </div>
                  <div className="h-8 w-px bg-border" />
                  <div>
                    <div className="text-[10px] uppercase text-muted-foreground">Pending</div>
                    <div className={`text-sm font-semibold ${s.pending > 0 ? "text-destructive" : "text-[color:var(--success)]"}`}>{inr(s.pending)}</div>
                  </div>
                  <Button size="sm" variant="outline" className="glass-soft" onClick={() => toast.info(`Opening ${s.name}`)}>View</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
