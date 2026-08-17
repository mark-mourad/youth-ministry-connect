import { useState } from "react";
import { CalendarPlus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { EventCard, type EventRow } from "@/components/EventCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { EVENT_TYPES, RECURRENCES, WEEK_DAYS } from "@/lib/constants";

type Props = { events: EventRow[]; servantId: string; gradeLevel: string | null };

const toLocalInput = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export function EventsManager({ events, servantId, gradeLevel }: Props) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<EventRow | null>(null);
  const [form, setForm] = useState({
    title: "",
    event_type: "sunday_school",
    start_time: "",
    end_time: "",
    recurrence: "once",
    weekday: "5",
    custom_days: "",
  });

  const openNew = () => {
    setEditing(null);
    setForm({
      title: "",
      event_type: "sunday_school",
      start_time: "",
      end_time: "",
      recurrence: "once",
      weekday: "5",
      custom_days: "",
    });
    setOpen(true);
  };

  const openEdit = (event: EventRow) => {
    setEditing(event);
    setForm({
      title: event.title,
      event_type: event.event_type,
      start_time: toLocalInput(event.start_time),
      end_time: toLocalInput(event.end_time),
      recurrence: event.recurrence,
      weekday: event.recurrence === "weekly" ? (event.custom_days?.[0] ?? "5") : "5",
      custom_days: event.recurrence === "custom" ? (event.custom_days ?? []).join(", ") : "",
    });
    setOpen(true);
  };

  const refresh = () => void queryClient.invalidateQueries({ queryKey: ["events"] });

  const save = async () => {
    if (!form.title || !form.start_time || !form.end_time) {
      toast.error("املأ العنوان والتوقيت");
      return;
    }
    const custom_days =
      form.recurrence === "weekly"
        ? [form.weekday]
        : form.recurrence === "custom"
          ? form.custom_days
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [];

    const payload = {
      title: form.title.trim(),
      event_type: form.event_type as "sunday_school",
      start_time: new Date(form.start_time).toISOString(),
      end_time: new Date(form.end_time).toISOString(),
      recurrence: form.recurrence as "once",
      custom_days,
      grade_level: (gradeLevel as "1st_sec") ?? null,
      created_by: servantId,
    };

    const { error } = editing
      ? await supabase.from("events").update(payload).eq("id", editing.id)
      : await supabase.from("events").insert(payload);

    if (error) {
      toast.error("تعذر حفظ الحدث");
      return;
    }
    toast.success(editing ? "تم تعديل الحدث" : "تمت إضافة الحدث");
    setOpen(false);
    refresh();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) {
      toast.error("تعذر حذف الحدث");
      return;
    }
    toast.success("تم حذف الحدث");
    refresh();
  };

  return (
    <section className="space-y-3">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <h2 className="truncate text-end text-sm font-bold">الفعاليات القادمة</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-full font-bold" onClick={openNew}>
              <CalendarPlus className="size-4" />
              إضافة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-end">
                {editing ? "تعديل حدث" : "إضافة حدث جديد"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>عنوان الحدث</Label>
                <Input
                  className="h-11 bg-elevated text-end"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>نوع الحدث</Label>
                <Select
                  value={form.event_type}
                  onValueChange={(v) => setForm((f) => ({ ...f, event_type: v }))}
                >
                  <SelectTrigger className="h-11 w-full bg-elevated">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>من</Label>
                  <Input
                    type="datetime-local"
                    className="h-11 bg-elevated"
                    value={form.start_time}
                    onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>إلى</Label>
                  <Input
                    type="datetime-local"
                    className="h-11 bg-elevated"
                    value={form.end_time}
                    onChange={(e) => setForm((f) => ({ ...f, end_time: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>التكرار</Label>
                <Select
                  value={form.recurrence}
                  onValueChange={(v) => setForm((f) => ({ ...f, recurrence: v }))}
                >
                  <SelectTrigger className="h-11 w-full bg-elevated">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RECURRENCES.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {form.recurrence === "weekly" && (
                <div className="space-y-2">
                  <Label>يوم الأسبوع</Label>
                  <Select
                    value={form.weekday}
                    onValueChange={(v) => setForm((f) => ({ ...f, weekday: v }))}
                  >
                    <SelectTrigger className="h-11 w-full bg-elevated">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WEEK_DAYS.map((d) => (
                        <SelectItem key={d.value} value={d.value}>
                          {d.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {form.recurrence === "custom" && (
                <div className="space-y-2">
                  <Label>تواريخ مخصصة (مفصولة بفاصلة)</Label>
                  <Input
                    dir="ltr"
                    placeholder="2026-09-05, 2026-09-19"
                    className="h-11 bg-elevated"
                    value={form.custom_days}
                    onChange={(e) => setForm((f) => ({ ...f, custom_days: e.target.value }))}
                  />
                </div>
              )}
              <Button onClick={() => void save()} className="h-12 w-full rounded-full font-bold">
                حفظ
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {events.length === 0 ? (
        <p className="rounded-xl bg-card p-4 text-center text-xs text-muted-foreground">
          لا توجد فعاليات بعد
        </p>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              footer={
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="flex-1 rounded-full"
                    onClick={() => openEdit(event)}
                  >
                    <Pencil className="size-3.5" />
                    تعديل
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1 rounded-full"
                    onClick={() => void remove(event.id)}
                  >
                    <Trash2 className="size-3.5" />
                    حذف
                  </Button>
                </div>
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}
