import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, GraduationCap, Mail, User, UserPlus } from "lucide-react";
import { toast } from "sonner";
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
import { supabase } from "@/integrations/supabase/client";
import { GRADES } from "@/lib/constants";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "إنشاء حساب طالب | اجتماعات ثانوي" },
      { name: "description", content: "أنشئ حسابك كطالب واختر مرحلتك الدراسية وفصلك." },
      { property: "og:title", content: "إنشاء حساب طالب | اجتماعات ثانوي" },
      { property: "og:description", content: "أنشئ حسابك كطالب واختر مرحلتك الدراسية وفصلك." },
    ],
  }),
  component: SignupPage,
});

type ClassRow = { id: string; name: string; grade_level: string };

function SignupPage() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm: "",
    grade_level: "",
    class_id: "",
  });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void supabase
      .from("classes")
      .select("id, name, grade_level")
      .order("name")
      .then(({ data }) => setClasses((data as ClassRow[]) ?? []));
  }, []);

  const gradeClasses = useMemo(
    () => classes.filter((c) => c.grade_level === form.grade_level),
    [classes, form.grade_level],
  );

  const set = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value, ...(key === "grade_level" ? { class_id: "" } : {}) }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error("كلمة المرور 6 أحرف على الأقل");
      return;
    }
    if (form.password !== form.confirm) {
      toast.error("كلمة المرور غير متطابقة");
      return;
    }
    if (!form.grade_level) {
      toast.error("اختر المرحلة الدراسية");
      return;
    }

    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: form.full_name },
      },
    });
    if (error || !data.user) {
      setBusy(false);
      toast.error(error?.message ?? "تعذر إنشاء الحساب");
      return;
    }

    const { error: profileError } = await supabase.from("users").insert({
      id: data.user.id,
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      role: "student",
      grade_level: form.grade_level as "1st_sec",
      class_id: form.class_id || null,
    });
    setBusy(false);
    if (profileError) {
      toast.error("تم إنشاء الحساب لكن تعذر حفظ البيانات، حاول تسجيل الدخول");
      return;
    }
    toast.success("تم إنشاء الحساب بنجاح");
    void navigate({ to: "/student", replace: true });
  };

  return (
    <main className="min-h-screen bg-background px-5 py-6">
      <header className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
        <Link to="/login" aria-label="رجوع" className="text-foreground">
          <ArrowLeft className="size-6" />
        </Link>
        <h1 className="truncate text-center text-base font-bold text-primary">اجتماعات ثانوي</h1>
      </header>

      <div className="mx-auto mt-6 w-full max-w-sm">
        <h2 className="text-center text-2xl font-extrabold">إنشاء حساب جديد</h2>
        <p className="mt-1 text-center text-xs text-muted-foreground">
          املأ بياناتك للانضمام إلى خدمة ثانوي
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-2xl bg-card p-5">
          <div className="space-y-2">
            <Label>الاسم الرباعي</Label>
            <div className="relative">
              <User className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-primary" />
              <Input
                required
                className="h-12 bg-elevated pe-10 text-end"
                placeholder="أدخل اسمك الكامل"
                value={form.full_name}
                onChange={(e) => set("full_name", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>البريد الإلكتروني</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-primary" />
              <Input
                required
                type="email"
                dir="ltr"
                className="h-12 bg-elevated pe-10 text-end"
                placeholder="example@domain.com"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>المرحلة الدراسية</Label>
              <Select value={form.grade_level} onValueChange={(v) => set("grade_level", v)}>
                <SelectTrigger className="h-12 w-full bg-elevated">
                  <GraduationCap className="size-4 text-primary" />
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
              <Label>الفصل</Label>
              <Select
                value={form.class_id}
                onValueChange={(v) => set("class_id", v)}
                disabled={!form.grade_level}
              >
                <SelectTrigger className="h-12 w-full bg-elevated">
                  <SelectValue placeholder="اختر الفصل" />
                </SelectTrigger>
                <SelectContent>
                  {gradeClasses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>كلمة المرور</Label>
            <Input
              required
              type="password"
              className="h-12 bg-elevated text-end"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>تأكيد كلمة المرور</Label>
            <Input
              required
              type="password"
              className="h-12 bg-elevated text-end"
              placeholder="••••••••"
              value={form.confirm}
              onChange={(e) => set("confirm", e.target.value)}
            />
          </div>

          <Button
            type="submit"
            disabled={busy}
            className="h-12 w-full rounded-full text-base font-bold glow-primary"
          >
            <UserPlus className="size-5" />
            {busy ? "جاري الإنشاء..." : "إنشاء الحساب"}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          لديك حساب بالفعل؟{" "}
          <Link to="/login" className="font-bold text-primary">
            سجل دخولك
          </Link>
        </p>
      </div>
    </main>
  );
}
