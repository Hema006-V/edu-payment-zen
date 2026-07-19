import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Bell, Search, Moon, Sun, ChevronDown, UserRound, Shield, Wallet } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useRole } from "@/lib/role-store";
import { NOTIFICATIONS } from "@/lib/mock-data";
import { useNavigate } from "@tanstack/react-router";

export function AppTopbar() {
  const [role, setRole] = useRole();
  const navigate = useNavigate();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const roleLabel = { admin: "Administrator", accountant: "Accountant", parent: "Parent" }[role];
  const RoleIcon = role === "parent" ? UserRound : role === "accountant" ? Wallet : Shield;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/60 bg-background/60 px-3 backdrop-blur-xl sm:px-6">
      <SidebarTrigger />
      <div className="relative hidden max-w-md flex-1 md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search students, receipts, transactions…" className="glass-soft pl-9" />
      </div>
      <div className="flex-1 md:hidden" />
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => setDark(d => !d)} aria-label="Toggle theme">
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-96 p-0">
            <div className="border-b p-3 font-semibold">Notifications</div>
            <div className="max-h-96 overflow-auto">
              {NOTIFICATIONS.map(n => (
                <div key={n.id} className="border-b px-4 py-3 last:border-0 hover:bg-muted/40">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-medium">{n.title}</div>
                      <div className="text-xs text-muted-foreground">{n.desc}</div>
                    </div>
                    <span className="whitespace-nowrap text-[10px] text-muted-foreground">{n.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="glass-soft gap-2">
              <RoleIcon className="h-4 w-4 text-primary" />
              <span className="hidden text-sm sm:inline">{roleLabel}</span>
              <ChevronDown className="h-3.5 w-3.5 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Switch role (demo)</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => { setRole("admin"); navigate({ to: "/" }); }}>
              <Shield className="mr-2 h-4 w-4" /> Administrator
              {role === "admin" && <Badge variant="secondary" className="ml-auto">Active</Badge>}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setRole("accountant"); navigate({ to: "/" }); }}>
              <Wallet className="mr-2 h-4 w-4" /> Accountant
              {role === "accountant" && <Badge variant="secondary" className="ml-auto">Active</Badge>}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setRole("parent"); navigate({ to: "/parent" }); }}>
              <UserRound className="mr-2 h-4 w-4" /> Parent
              {role === "parent" && <Badge variant="secondary" className="ml-auto">Active</Badge>}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
