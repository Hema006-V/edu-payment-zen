import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { GraduationCap, Shield, Wallet, UserRound, Lock, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { loginFn, getCurrentUserFn } from "@/lib/auth-server";
import { setRole } from "@/lib/role-store";

export const Route = createFileRoute("/login" as any)({
  beforeLoad: async () => {
    const user = await getCurrentUserFn();
    if (user) {
      throw redirect({ to: user.role === "parent" ? "/parent" : "/" });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      const result = await loginFn({ data: { email, password } });
      
      if (!result.success) {
        toast.error(result.error || "Failed to log in");
        return;
      }

      const user = result.user;
      
      // Update client role-store
      setRole(user.role as any);
      
      toast.success("Welcome back!", {
        description: `Logged in as ${user.email} (${user.role})`
      });

      // Redirect depending on user role
      if (user.role === "parent") {
        navigate({ to: "/parent" as any });
      } else {
        navigate({ to: "/" });
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to log in");
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (role: "admin" | "accountant" | "parent") => {
    if (role === "admin") {
      setEmail("admin@abcinternational.edu");
      setPassword("admin123");
    } else if (role === "accountant") {
      setEmail("accountant@abcinternational.edu");
      setPassword("accountant123");
    } else {
      setEmail("aarav.sharma@parent.abc.edu");
      setPassword("parent123");
    }
  };

  return (
    <div className="flex w-full max-w-[420px] animate-fade-in flex-col px-4 py-8">
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-[var(--shadow-soft)]">
          <GraduationCap className="h-6 w-6" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold text-gradient">Edu Payment Zen</h1>
        <p className="mt-1 text-sm text-muted-foreground">ABC International School Portal</p>
      </div>

      <Card className="glass border-0">
        <form onSubmit={handleLogin}>
          <CardHeader>
            <CardTitle className="font-display">Log in</CardTitle>
            <CardDescription>Enter your credentials to access your portal dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@school.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <Button type="submit" className="w-full shadow-[var(--shadow-soft)]" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <div className="mt-6 flex flex-col gap-3 rounded-2xl bg-muted/40 p-4 border border-border/40">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground text-center">
          Demostration Quick Logins
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fillCredentials("admin")}
            className="text-xs py-1 px-2 h-auto flex flex-col items-center gap-1 glass-soft border-0"
          >
            <Shield className="h-4 w-4 text-primary" />
            <span>Admin</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fillCredentials("accountant")}
            className="text-xs py-1 px-2 h-auto flex flex-col items-center gap-1 glass-soft border-0"
          >
            <Wallet className="h-4 w-4 text-primary" />
            <span>Accountant</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fillCredentials("parent")}
            className="text-xs py-1 px-2 h-auto flex flex-col items-center gap-1 glass-soft border-0"
          >
            <UserRound className="h-4 w-4 text-primary" />
            <span>Parent</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
