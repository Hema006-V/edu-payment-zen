import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Users, Receipt, Wallet, FileText, BellRing,
  BarChart3, ScrollText, GraduationCap, Sparkles,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { SCHOOL } from "@/lib/mock-data";
import { useRole } from "@/lib/role-store";

const adminItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Students", url: "/students", icon: Users },
  { title: "Fee Types", url: "/fees", icon: Wallet },
  { title: "Payments", url: "/payments", icon: Receipt },
  { title: "Receipts", url: "/receipts", icon: FileText },
  { title: "Reminders", url: "/reminders", icon: BellRing },
  { title: "Reports", url: "/reports", icon: BarChart3 },
  { title: "Audit Log", url: "/audit", icon: ScrollText },
];

const parentItems = [
  { title: "My Dashboard", url: "/parent", icon: LayoutDashboard },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: s => s.location.pathname });
  const [role] = useRole();

  const items = role === "parent" ? parentItems : adminItems;

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-[var(--shadow-soft)]">
            <GraduationCap className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="truncate font-display text-sm font-bold leading-tight">{SCHOOL.name}</div>
              <div className="truncate text-[11px] text-muted-foreground">Fee Management</div>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{role === "parent" ? "Parent Portal" : "Manage"}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map(item => {
                const active = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                      <Link to={item.url} className="flex items-center gap-3">
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        {!collapsed && (
          <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/40 p-3 text-xs">
            <div className="flex items-center gap-2 font-semibold">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Premium Plan
            </div>
            <div className="mt-1 text-muted-foreground">All modules enabled · v1.0</div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
