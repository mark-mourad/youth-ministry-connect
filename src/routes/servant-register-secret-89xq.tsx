import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GRADES } from "@/lib/constants";
import { registerServant } from "@/lib/servant.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/servant-register-secret-89xq")({
  head: () => ({
    meta: [
      { title: "تسجيل خادم | اجتماعات ثانوي" },
      { name: "description", content: "صفحة تسجيل الخدام الخاصة." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "تسجيل خادم | اجتماعات ثانوي" },
      { property: "og:description", content: "صفحة تسجيل الخدام الخاصة." },
    ],
  }),
  component: ServantRegister,
});

function ServantRegister() {
  const navigate = useNavigate();
  const register = useServerFn(registerServant);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    grade_level: "",
    passcode: "",
  });

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.grade_level) {
      toast.error("اختر المرحلة التي تخدمها");
      return;
    }
    setBusy(true);
    const result = await register({
      data: {
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        password: form.password,
        grade_level: form.grade_level as "1st_sec",
        passcode: form.passcode,
      },
    });
    if (!result.ok) {
      setBusy(false);
      toast.error(result.error);
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({
      email: form.email.trim(),
      password: form.password,
    });
    setBusy(false);
    if (error) {
      toast.success("تم إنشاء حساب الخادم، سجّل الدخول الآن");
      void navigate({ to: "/login", replace: true });
      return;
    }
    toast.success("أهلاً بك في خدمة ثانوي");
    void navigate({ to: "/servant", replace: true });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <Logo className="size-24" />
          <h1 className="mt-5 text-xl font-extrabold">تسجيل خادم جديد</h1>
          <p className="mt-1 text-xs text-muted-foreground">هذه الصفحة مخصصة للخدام فقط</p>
        </div>

        <form onSubmit={onSubmit} className="mt-7 space-y-4 rounded-2xl bg-card p-5">
          <div className="space-y-2">
            <Label>الاسم</Label>
            <Input
              required
              className="h-12 bg-elevated text-end"
              value={form.full_name}
              onChange={(e) => set("full_name", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>البريد الإلكتروني</Label>
            <Input
              required
              type="email"
              dir="ltr"
              className="h-12 bg-elevated text-end"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>كلمة المرور</Label>
            <Input
              required
              type="password"
              className="h-12 bg-elevated text-end"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>المرحلة التي تخدمها</Label>
            <Select value={form.grade_level} onValueChange={(v) => set("grade_level", v)}>
              <SelectTrigger className="h-12 w-full bg-elevated">
                <SelectValue placeholder="اختر المرحلة" />
              </SelectTrigger>
              <SelectContent>
                {GRADES.map((g) => (
                  <SelectItem key={g.value} value={g.value}>
                    {g.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>كلمة السر السرية</Label>
            <Input
              required
              type="password"
              className="h-12 bg-elevated text-end"
              value={form.passcode}
              onChange={(e) => set("passcode", e.target.value)}
            />
          </div>

          <Button
            type="submit"
            disabled={busy}
            className="h-12 w-full rounded-full text-base font-bold glow-primary"
          >
            <ShieldCheck className="size-5" />
            {busy ? "جاري التسجيل..." : "تسجيل خادم"}
          </Button>
        </form>
      </div>
    </main>
  );
}
