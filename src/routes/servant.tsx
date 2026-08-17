import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BarChart3, LogOut, ScanLine, Users } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { Logo } from "@/components/Logo";
import { AttendancePanel } from "@/components/servant/AttendancePanel";
import { EventsManager } from "@/components/servant/EventsManager";
import { Scanner } from "@/components/servant/Scanner";
import { StudentModal } from "@/components/servant/StudentModal";
import { useAuth } from "@/lib/auth";
import {
  useAttendance,
  useClasses,
  useEvents,
  useJournals,
  useStudents,
  type StudentRow,
} from "@/lib/servant-data";

export const Route = createFileRoute("/servant")({
  head: () => ({
    meta: [
      { title: "لوحة الخادم | اجتماعات ثانوي" },
      {
        name: "description",
        content: "إدارة الفعاليات، تسجيل الحضور بالكود، متابعة النوتة الروحية والافتقاد.",
      },
      { property: "og:title", content: "لوحة الخادم | اجتماعات ثانوي" },
      {
        property: "og:description",
        content: "إدارة الفعاليات، تسجيل الحضور بالكود، متابعة النوتة الروحية والافتقاد.",
      },
    ],
  }),
  component: ServantPage,
});

function ServantPage() {
  const { session, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("home");
  const [selected, setSelected] = useState<StudentRow | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!session) void navigate({ to: "/login", replace: true });
    else if (profile && profile.role !== "servant") void navigate({ to: "/student", replace: true });
  }, [loading, session, profile, navigate]);

  const { data: events = [] } = useEvents();
  const { data: students = [] } = useStudents();
  const { data: attendance = [] } = useAttendance();
  const { data: journals = [] } = useJournals();
  const { data: classes = [] } = useClasses();

  if (!profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <Logo className="size-20 animate-pulse" />
      </main>
    );
  }

  const upcoming = events.filter((e) => new Date(e.end_time).getTime() >= Date.now() - 86400000);

  return (
    <div className="min-h-screen bg-background pb-24">
      <main className="mx-auto w-full max-w-md px-4 pt-5">
        <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
          <Logo className="size-11 shrink-0" />
          <div className="min-w-0 text-end">
            <p className="truncate text-sm font-bold">{profile.full_name}</p>
            <p className="truncate text-[11px] text-muted-foreground">خادم</p>
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
          <div className="mt-5 space-y-6">
            <div className="grid grid-cols-3 gap-2 text-center">
              <Stat label="مخدومين" value={students.length} />
              <Stat label="فعاليات" value={events.length} />
              <Stat label="تسجيلات حضور" value={attendance.length} />
            </div>
            <EventsManager
              events={upcoming}
              servantId={profile.id}
              gradeLevel={profile.grade_level ?? null}
            />
          </div>
        )}

        {tab === "scan" && (
          <div className="mt-5">
            <Scanner events={upcoming} servantId={profile.id} />
          </div>
        )}

        {tab === "students" && (
          <div className="mt-5">
            <AttendancePanel
              students={students}
              events={events}
              attendance={attendance}
              journals={journals}
              classes={classes}
              onSelect={setSelected}
            />
          </div>
        )}
      </main>

      <StudentModal
        student={selected}
        servantId={profile.id}
        events={events}
        attendance={attendance}
        journals={journals}
        onClose={() => setSelected(null)}
      />

      <BottomNav
        active={tab}
        onChange={setTab}
        items={[
          { key: "home", label: "الرئيسية", icon: BarChart3 },
          { key: "scan", label: "مسح", icon: ScanLine },
          { key: "students", label: "المخدومين", icon: Users },
        ]}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-card py-3">
      <p className="text-xl font-extrabold text-primary">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}
