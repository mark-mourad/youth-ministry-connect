import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { BookOpen, Home, LogOut, QrCode } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { BottomNav } from "@/components/BottomNav";
import { EventCard, type EventRow } from "@/components/EventCard";
import { Logo } from "@/components/Logo";
import { QRCodeView } from "@/components/QRCodeView";
import { JournalForm } from "@/components/student/JournalForm";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { gradeLabel, PRAYERS } from "@/lib/constants";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/student")({
  head: () => ({
    meta: [
      { title: "حسابي | اجتماعات ثانوي" },
      { name: "description", content: "لوحة الطالب: كود الحضور، الفعاليات القادمة والنوتة الروحية." },
      { property: "og:title", content: "حسابي | اجتماعات ثانوي" },
      {
        property: "og:description",
        content: "لوحة الطالب: كود الحضور، الفعاليات القادمة والنوتة الروحية.",
      },
    ],
  }),
  component: StudentPage,
});

function StudentPage() {
  const { session, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("home");

  useEffect(() => {
    if (loading) return;
    if (!session) void navigate({ to: "/login", replace: true });
    else if (profile?.role === "servant") void navigate({ to: "/servant", replace: true });
  }, [loading, session, profile, navigate]);

  const studentId = profile?.id;

  const { data: className } = useQuery({
    queryKey: ["class", profile?.class_id],
    enabled: Boolean(profile?.class_id),
    queryFn: async () => {
      const { data } = await supabase
        .from("classes")
        .select("name")
        .eq("id", profile!.class_id!)
        .maybeSingle();
      return data?.name ?? null;
    },
  });

  const { data: events = [] } = useQuery({
    queryKey: ["upcoming-events", profile?.grade_level],
    enabled: Boolean(profile),
    queryFn: async () => {
      const { data } = await supabase
        .from("events")
        .select("*")
        .gte("end_time", new Date(Date.now() - 86400000).toISOString())
        .order("start_time")
        .limit(10);
      return (data ?? []) as EventRow[];
    },
  });

  const { data: journal = [], refetch: refetchJournal } = useQuery({
    queryKey: ["journal-week", studentId],
    enabled: Boolean(studentId),
    queryFn: async () => {
      const since = new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10);
      const { data } = await supabase
        .from("spiritual_journal")
        .select("*")
        .eq("student_id", studentId!)
        .gte("date", since);
      return data ?? [];
    },
  });

  const weekly = useMemo(() => {
    let prayerCount = 0;
    let chapters = 0;
    for (const row of journal) {
      const p = (row.prayers ?? {}) as Record<string, boolean>;
      prayerCount += PRAYERS.filter((x) => p[x.key]).length;
      if (row.bible_chapter) chapters += 1;
    }
    return { prayerCount, chapters, days: journal.length };
  }, [journal]);

  if (!profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <Logo className="size-20 animate-pulse" />
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <main className="mx-auto w-full max-w-md px-4 pt-5">
        <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
          <Logo className="size-11 shrink-0" />
          <div className="min-w-0 text-end">
            <p className="truncate text-sm font-bold">{profile.full_name}</p>
            <p className="truncate text-[11px] text-muted-foreground">
              {gradeLabel(profile.grade_level)} · {className ?? "بدون فصل"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void signOut()}
            aria-label="تسجيل الخروج"
            className="shrink-0 text-muted-foreground"
          >
            <LogOut className="size-5" />
          </button>
        </header>

        {tab === "home" && (
          <section className="mt-5 space-y-6">
            <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 rounded-2xl bg-[oklch(0.85_0.07_250)] p-4">
              <QRCodeView value={profile.id} size={104} className="rounded-lg bg-white p-1.5" />
              <div className="min-w-0 text-end text-[oklch(0.2_0_0)]">
                <p className="truncate text-base font-extrabold">{profile.full_name}</p>
                <p className="truncate text-sm font-semibold">{gradeLabel(profile.grade_level)}</p>
                <p className="truncate text-sm">{className ?? "بدون فصل"}</p>
              </div>
            </div>

            <div>
              <h2 className="mb-2 text-end text-sm font-bold">الفعاليات القادمة</h2>
              {events.length === 0 ? (
                <p className="rounded-xl bg-card p-4 text-center text-xs text-muted-foreground">
                  لا توجد فعاليات قادمة حالياً
                </p>
              ) : (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {events.map((e) => (
                    <EventCard key={e.id} event={e} />
                  ))}
                </div>
              )}
            </div>

            <div className="card-edge p-4 pt-5">
              <h2 className="text-end text-sm font-bold">ملخص الأسبوع الروحي</h2>
              <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                <Stat label="أيام مسجلة" value={weekly.days} />
                <Stat label="صلوات" value={weekly.prayerCount} />
                <Stat label="إصحاحات" value={weekly.chapters} />
              </div>
            </div>
          </section>
        )}

        {tab === "journal" && (
          <div className="mt-5">
            <JournalForm studentId={profile.id} onSaved={() => void refetchJournal()} />
          </div>
        )}

        {tab === "qr" && (
          <section className="mt-8 flex flex-col items-center gap-5">
            <h2 className="text-lg font-extrabold">كود الحضور</h2>
            <QRCodeView value={profile.id} size={280} className="rounded-2xl bg-white p-4" />
            <p className="text-center text-xs text-muted-foreground">
              اعرض الكود للخادم لتسجيل حضورك
            </p>
            <Button variant="secondary" className="rounded-full" onClick={() => setTab("home")}>
              رجوع
            </Button>
          </section>
        )}
      </main>

      <BottomNav
        active={tab}
        onChange={setTab}
        items={[
          { key: "home", label: "الرئيسية", icon: Home },
          { key: "journal", label: "النوتة", icon: BookOpen },
          { key: "qr", label: "كودي", icon: QrCode },
        ]}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-elevated py-3">
      <p className="text-xl font-extrabold text-primary">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}
