import { useMemo, useState } from "react";
import { AlertTriangle, FileDown, Search, Sheet } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { EventRow } from "@/components/EventCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GRADES, gradeLabel } from "@/lib/constants";
import { exportPdf, exportXlsx } from "@/lib/exports";
import {
  studentStats,
  type AttendanceRow,
  type JournalRow,
  type StudentRow,
} from "@/lib/servant-data";

export function AttendancePanel({
  students,
  events,
  attendance,
  journals,
  classes,
  onSelect,
}: {
  students: StudentRow[];
  events: EventRow[];
  attendance: AttendanceRow[];
  journals: JournalRow[];
  classes: { id: string; name: string }[];
  onSelect: (student: StudentRow) => void;
}) {
  const [search, setSearch] = useState("");
  const [grade, setGrade] = useState("all");
  const [classId, setClassId] = useState("all");

  const rows = useMemo(() => {
    return students
      .filter((s) => (grade === "all" ? true : s.grade_level === grade))
      .filter((s) => (classId === "all" ? true : s.class_id === classId))
      .filter((s) => s.full_name.toLowerCase().includes(search.trim().toLowerCase()))
      .map((s) => ({
        student: s,
        stats: studentStats(s.id, events, attendance),
        journalDays: journals.filter((j) => j.student_id === s.id).length,
      }))
      .sort((a, b) => a.stats.percentage - b.stats.percentage);
  }, [students, events, attendance, journals, grade, classId, search]);

  const chartData = useMemo(
    () =>
      GRADES.map((g) => {
        const list = students.filter((s) => s.grade_level === g.value);
        const avg =
          list.length === 0
            ? 0
            : Math.round(
                list.reduce((sum, s) => sum + studentStats(s.id, events, attendance).percentage, 0) /
                  list.length,
              );
        return { name: g.label, نسبة: avg };
      }),
    [students, events, attendance],
  );

  const reportRows = rows.map((r) => ({
    الاسم: r.student.full_name,
    "المرحلة": gradeLabel(r.student.grade_level),
    "الفصل": classes.find((c) => c.id === r.student.class_id)?.name ?? "—",
    "نسبة الحضور": `${r.stats.percentage}%`,
    "غياب متتالي": r.stats.consecutiveAbsences,
    "أيام النوتة": r.journalDays,
  }));

  const alerts = rows.filter((r) => r.stats.needsVisit);

  return (
    <section className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <Select value={grade} onValueChange={setGrade}>
          <SelectTrigger className="h-11 bg-elevated">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل المراحل</SelectItem>
            {GRADES.map((g) => (
              <SelectItem key={g.value} value={g.value}>
                {g.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={classId} onValueChange={setClassId}>
          <SelectTrigger className="h-11 bg-elevated">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الفصول</SelectItem>
            {classes.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="relative">
        <Search className="absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث باسم المخدوم"
          className="h-11 bg-elevated pe-9 text-end"
        />
      </div>

      {alerts.length > 0 && (
        <div className="rounded-xl bg-card p-3 text-end">
          <p className="flex flex-row-reverse items-center gap-2 text-xs font-bold text-warning">
            <AlertTriangle className="size-4" />
            {alerts.length} مخدوم يحتاج افتقاد (غياب متتالي)
          </p>
        </div>
      )}

      <div className="card-edge p-3 pt-4">
        <h3 className="mb-2 text-end text-xs font-bold">متوسط الحضور حسب المرحلة</h3>
        <div className="h-44 w-full" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} />
              <YAxis tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  background: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="نسبة" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-2">
        {rows.length === 0 ? (
          <p className="rounded-xl bg-card p-4 text-center text-xs text-muted-foreground">
            لا يوجد مخدومين مطابقين
          </p>
        ) : (
          rows.map(({ student, stats }) => (
            <button
              key={student.id}
              type="button"
              onClick={() => onSelect(student)}
              className="grid w-full grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-xl bg-card p-3 text-end transition-colors hover:bg-elevated"
            >
              <span
                className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-extrabold ${
                  stats.percentage >= 75
                    ? "bg-primary/15 text-primary"
                    : stats.percentage >= 50
                      ? "bg-warning/15 text-warning"
                      : "bg-destructive/15 text-destructive"
                }`}
              >
                {stats.percentage}%
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold">{student.full_name}</span>
                <span className="block truncate text-[11px] text-muted-foreground">
                  {gradeLabel(student.grade_level)} ·{" "}
                  {classes.find((c) => c.id === student.class_id)?.name ?? "بدون فصل"}
                  {stats.needsVisit ? " · يحتاج افتقاد" : ""}
                </span>
              </span>
            </button>
          ))
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="secondary"
          className="h-11 rounded-full font-bold"
          onClick={() => exportXlsx(reportRows, "الحضور", "attendance-report")}
        >
          <Sheet className="size-4" />
          Excel
        </Button>
        <Button
          variant="secondary"
          className="h-11 rounded-full font-bold"
          onClick={() => exportPdf(reportRows, "تقرير الحضور", "attendance-report")}
        >
          <FileDown className="size-4" />
          PDF
        </Button>
      </div>
    </section>
  );
}
