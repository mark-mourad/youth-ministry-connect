import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "اجتماعات ثانوي | Thanwy Meetings" },
      {
        name: "description",
        content: "منصة خدمة ثانوي: تسجيل الحضور بالـ QR، النوتة الروحية، ومتابعة الفصول.",
      },
      { property: "og:title", content: "اجتماعات ثانوي | Thanwy Meetings" },
      {
        property: "og:description",
        content: "منصة خدمة ثانوي: تسجيل الحضور بالـ QR، النوتة الروحية، ومتابعة الفصول.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { session, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!session) {
      void navigate({ to: "/login", replace: true });
      return;
    }
    void navigate({ to: profile?.role === "servant" ? "/servant" : "/student", replace: true });
  }, [loading, session, profile, navigate]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6">
      <Logo className="size-28 animate-pulse" />
      <h1 className="text-xl font-bold">اجتماعات ثانوي</h1>
      <p className="text-sm text-muted-foreground">جاري التحميل...</p>
    </main>
  );
}
