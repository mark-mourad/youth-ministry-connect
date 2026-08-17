import { useEffect, useState } from "react";
import { BookOpen, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { NEW_TESTAMENT, OLD_TESTAMENT, PRAYERS } from "@/lib/constants";

type Prayers = { baker: boolean; ghroob: boolean; noom: boolean; free: boolean };

const emptyPrayers: Prayers = { baker: false, ghroob: false, noom: false, free: false };

export function JournalForm({ studentId, onSaved }: { studentId: string; onSaved?: () => void }) {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [prayers, setPrayers] = useState<Prayers>(emptyPrayers);
  const [testament, setTestament] = useState<"old" | "new" | "">("");
  const [book, setBook] = useState("");
  const [chapter, setChapter] = useState("");
  const [other, setOther] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void supabase
      .from("spiritual_journal")
      .select("*")
      .eq("student_id", studentId)
      .eq("date", date)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) {
          setPrayers(emptyPrayers);
          setTestament("");
          setBook("");
          setChapter("");
          setOther("");
          return;
        }
        setPrayers({ ...emptyPrayers, ...(data.prayers as Prayers) });
        setTestament((data.bible_testament as "old" | "new") ?? "");
        setBook(data.bible_book ?? "");
        setChapter(data.bible_chapter ? String(data.bible_chapter) : "");
        setOther(data.other_readings ?? "");
      });
  }, [studentId, date]);

  const books = testament === "old" ? OLD_TESTAMENT : testament === "new" ? NEW_TESTAMENT : [];

  const save = async () => {
    setBusy(true);
    const { error } = await supabase.from("spiritual_journal").upsert(
      {
        student_id: studentId,
        date,
        prayers,
        bible_testament: testament === "" ? null : testament,
        bible_book: book || null,
        bible_chapter: chapter ? Number(chapter) : null,
        other_readings: other || null,
      },
      { onConflict: "student_id,date" },
    );
    setBusy(false);
    if (error) {
      toast.error("تعذر الحفظ، حاول مرة أخرى");
      return;
    }
    toast.success("تم حفظ النوتة الروحية");
    onSaved?.();
  };

  return (
    <section className="space-y-4">
      <div className="card-edge space-y-3 p-4 pt-5">
        <div className="flex flex-row-reverse items-center gap-2">
          <BookOpen className="size-5 text-primary" />
          <h2 className="text-sm font-bold">النوتة الروحية</h2>
        </div>
        <div className="space-y-2">
          <Label>التاريخ</Label>
          <Input
            type="date"
            value={date}
            max={today}
            onChange={(e) => setDate(e.target.value)}
            className="h-11 bg-elevated"
          />
        </div>
      </div>

      <div className="card-edge space-y-3 p-4 pt-5">
        <h3 className="text-end text-sm font-bold">الصلوات اليومية</h3>
        <div className="grid grid-cols-2 gap-3">
          {PRAYERS.map((p) => (
            <label
              key={p.key}
              className="flex flex-row-reverse items-center justify-between gap-2 rounded-xl bg-elevated px-3 py-3 text-sm"
            >
              <span>{p.label}</span>
              <Checkbox
                checked={prayers[p.key]}
                onCheckedChange={(v) => setPrayers((s) => ({ ...s, [p.key]: Boolean(v) }))}
              />
            </label>
          ))}
        </div>
      </div>

      <div className="card-edge space-y-3 p-4 pt-5">
        <h3 className="text-end text-sm font-bold">الكتاب المقدس</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>العهد</Label>
            <Select
              value={testament}
              onValueChange={(v) => {
                setTestament(v as "old" | "new");
                setBook("");
              }}
            >
              <SelectTrigger className="h-11 w-full bg-elevated">
                <SelectValue placeholder="اختر العهد" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="old">العهد القديم</SelectItem>
                <SelectItem value="new">العهد الجديد</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>السفر</Label>
            <Select value={book} onValueChange={setBook} disabled={!testament}>
              <SelectTrigger className="h-11 w-full bg-elevated">
                <SelectValue placeholder="اختر السفر" />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {books.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label>الإصحاح</Label>
          <Input
            type="number"
            min={1}
            value={chapter}
            onChange={(e) => setChapter(e.target.value)}
            className="h-11 bg-elevated text-end"
            placeholder="رقم الإصحاح"
          />
        </div>
        <div className="space-y-2">
          <Label>قراءات أخرى</Label>
          <Textarea
            value={other}
            onChange={(e) => setOther(e.target.value)}
            className="min-h-20 bg-elevated text-end"
            placeholder="سنكسار، كتاب روحي، تأملات..."
          />
        </div>
      </div>

      <Button
        onClick={() => void save()}
        disabled={busy}
        className="h-12 w-full rounded-full text-base font-bold glow-primary"
      >
        <Save className="size-5" />
        {busy ? "جاري الحفظ..." : "حفظ اليوم"}
      </Button>
    </section>
  );
}
