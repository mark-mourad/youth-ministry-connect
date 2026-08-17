import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { EventRow } from "@/components/EventCard";

export type StudentRow = {
  id: string;
  full_name: string;
  email: string | null;
  grade_level: string | null;
  class_id: string | null;
};

export type AttendanceRow = {
  id: string;
  event_id: string;
  student_id: string;
  scanned_at: string;
};

export type JournalRow = {
  id: string;
  student_id: string;
  date: string;
  prayers: Record<string, boolean> | null;
  bible_testament: string | null;
  bible_book: string | null;
  bible_chapter: number | null;
  other_readings: string | null;
};

export function useClasses(gradeLevel?: string | null) {
  return useQuery({
    queryKey: ["classes", gradeLevel ?? "all"],
    queryFn: async () => {
      let query = supabase.from("classes").select("id, name, grade_level").order("name");
      if (gradeLevel) query = query.eq("grade_level", gradeLevel as "1st_sec");
      const { data } = await query;
      return (data ?? []) as { id: string; name: string; grade_level: string }[];
    },
  });
}

export function useStudents(gradeLevel?: string | null) {
  return useQuery({
    queryKey: ["students", gradeLevel ?? "all"],
    queryFn: async () => {
      let query = supabase
        .from("users")
        .select("id, full_name, email, grade_level, class_id")
        .eq("role", "student")
        .order("full_name");
      if (gradeLevel) query = query.eq("grade_level", gradeLevel as "1st_sec");
      const { data } = await query;
      return (data ?? []) as StudentRow[];
    },
  });
}

export function useEvents() {
  return useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data } = await supabase
        .from("events")
        .select("*")
        .order("start_time", { ascending: false });
      return (data ?? []) as EventRow[];
    },
  });
}

export function useAttendance() {
  return useQuery({
    queryKey: ["attendance"],
    queryFn: async () => {
      const { data } = await supabase
        .from("attendance")
        .select("id, event_id, student_id, scanned_at")
        .order("scanned_at", { ascending: false });
      return (data ?? []) as AttendanceRow[];
    },
  });
}

export function useJournals() {
  return useQuery({
    queryKey: ["journals"],
    queryFn: async () => {
      const { data } = await supabase
        .from("spiritual_journal")
        .select("*")
        .order("date", { ascending: false })
        .limit(2000);
      return (data ?? []) as JournalRow[];
    },
  });
}

/** Attendance percentage + consecutive-absence count against past events. */
export function studentStats(
  studentId: string,
  events: EventRow[],
  attendance: AttendanceRow[],
) {
  const now = Date.now();
  const past = events
    .filter((e) => new Date(e.start_time).getTime() <= now)
    .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
  const attended = new Set(
    attendance.filter((a) => a.student_id === studentId).map((a) => a.event_id),
  );
  const present = past.filter((e) => attended.has(e.id)).length;
  let consecutiveAbsences = 0;
  for (const event of past) {
    if (attended.has(event.id)) break;
    consecutiveAbsences += 1;
  }
  return {
    totalEvents: past.length,
    present,
    percentage: past.length === 0 ? 0 : Math.round((present / past.length) * 100),
    consecutiveAbsences,
    needsVisit: consecutiveAbsences >= 2,
  };
}
