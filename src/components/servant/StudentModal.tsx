import { useEffect, useState } from "react";
import { NotebookPen } from "lucide-react";
import { toast } from "sonner";
import type { EventRow } from "@/components/EventCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { PRAYERS } from "@/lib/constants";
import type { AttendanceRow, JournalRow, StudentRow } from "@/lib/servant-data";

type Note = { id: string; note: string; created_at: string };

export function StudentModal({
  student,
  servantId,
  events,
  attendance,
  journals,
  onClose,
}: {
  student: StudentRow | null;
  servantId: string;
  events: EventRow[];
  attendance: AttendanceRow[];
  journals: JournalRow[];
  onClose: () => void;
}) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (!student) return;
    void supabase
      .from("followup_notes")
      .select("id, note, created_at")
      .eq("student_id", student.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setNotes((data as Note[]) ?? []));
  }, [student]);

  if (!student) return null;

  const studentAttendance = attendance.filter((a) => a.student_id === student.id);
  const studentJournals = journals.filter((j) => j.student_id === student.id).slice(0, 14);

  const addNote = async () => {
    if (!draft.trim()) return;
    const { data, error } = await supabase
      .from("followup_notes")
      .insert({ student_id: student.id, servant_id: servantId, note: draft.trim() })
      .select("id, note, created_at")
      .single();
    if (error) {
      toast.error("تعذر حفظ الملاحظة");
      return;
    }
    setNotes((n) => [data as Note, ...n]);
    setDraft("");
    toast.success("تم حفظ الملاحظة");
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-end">{student.full_name}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="attendance">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="attendance">الحضور</TabsTrigger>
            <TabsTrigger value="journal">النوتة</TabsTrigger>
            <TabsTrigger value="notes">الافتقاد</TabsTrigger>
          </TabsList>

          <TabsContent value="attendance" className="mt-3 space-y-2">
            {studentAttendance.length === 0 ? (
              <p className="text-center text-xs text-muted-foreground">لا يوجد حضور مسجل</p>
            ) : (
              studentAttendance.map((a) => (
                <div key={a.id} className="rounded-xl bg-elevated p-3 text-end text-xs">
                  <p className="font-bold">
                    {events.find((e) => e.id === a.event_id)?.title ?? "حدث"}
                  </p>
                  <p className="text-muted-foreground">
                    {new Date(a.scanned_at).toLocaleString("ar-EG")}
                  </p>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="journal" className="mt-3 space-y-2">
            {studentJournals.length === 0 ? (
              <p className="text-center text-xs text-muted-foreground">لا توجد تسجيلات روحية</p>
            ) : (
              studentJournals.map((j) => (
                <div key={j.id} className="rounded-xl bg-elevated p-3 text-end text-xs">
                  <p className="font-bold">{new Date(j.date).toLocaleDateString("ar-EG")}</p>
                  <p className="text-muted-foreground">
                    الصلوات: {PRAYERS.filter((p) => j.prayers?.[p.key]).map((p) => p.label).join("، ") || "—"}
                  </p>
                  <p className="text-muted-foreground">
                    {j.bible_book ? `${j.bible_book} — إصحاح ${j.bible_chapter ?? "—"}` : "لا قراءات"}
                  </p>
                  {j.other_readings ? (
                    <p className="text-muted-foreground">{j.other_readings}</p>
                  ) : null}
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="notes" className="mt-3 space-y-3">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="محتاج افتقاد، مريض، عنده امتحانات..."
              className="min-h-24 bg-elevated text-end"
            />
            <Button className="w-full rounded-full font-bold" onClick={() => void addNote()}>
              <NotebookPen className="size-4" />
              حفظ ملاحظة خاصة
            </Button>
            {notes.map((n) => (
              <div key={n.id} className="rounded-xl bg-elevated p-3 text-end text-xs">
                <p>{n.note}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {new Date(n.created_at).toLocaleString("ar-EG")}
                </p>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
