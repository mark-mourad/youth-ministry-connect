import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff, KeyRound, LogIn, Mail } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "تسجيل الدخول | اجتماعات ثانوي" },
      { name: "description", content: "سجّل الدخول إلى حسابك في اجتماعات ثانوي." },
      { property: "og:title", content: "تسجيل الدخول | اجتماعات ثانوي" },
      { property: "og:description", content: "سجّل الدخول إلى حسابك في اجتماعات ثانوي." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const { session, profile, loading } = useAuth();

  useEffect(() => {
    if (loading || !session || !profile) return;
    void navigate({ to: profile.role === "servant" ? "/servant" : "/student", replace: true });
  }, [loading, session, profile, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) {
      toast.error("بيانات الدخول غير صحيحة");
      return;
    }
    toast.success("أهلاً بك مرة أخرى");
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <Logo className="size-32 shadow-glow" />
          <h1 className="mt-7 text-2xl font-extrabold">أهلاً بك في اجتماع ثانوي</h1>
          <p className="mt-2 text-xs text-muted-foreground">
            يرجى تسجيل الدخول للوصول إلى حسابك
          </p>
        </div>

        <form onSubmit={onSubmit} className="mt-8 space-y-5 rounded-2xl bg-card p-5">
          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-primary" />
              <Input
                id="email"
                type="email"
                required
                dir="ltr"
                className="h-12 bg-elevated pe-10 text-end"
                placeholder="أدخل بريدك الإلكتروني"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">كلمة المرور</Label>
            <div className="relative">
              <KeyRound className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-primary" />
              <Input
                id="password"
                type={show ? "text" : "password"}
                required
                className="h-12 bg-elevated px-10 text-end"
                placeholder="أدخل كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                aria-label="إظهار كلمة المرور"
              >
                {show ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" disabled={busy} className="h-12 w-full rounded-full text-base font-bold glow-primary">
            <LogIn className="size-5" />
            {busy ? "جاري الدخول..." : "تسجيل الدخول"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          لسة معملتش حساب؟{" "}
          <Link to="/signup" className="font-bold text-primary">
            إنشاء حساب
          </Link>
        </p>
      </div>
    </main>
  );
}
