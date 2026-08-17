import { useEffect, useRef, useState } from "react";
import { CloudUpload, ScanLine } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import type { EventRow } from "@/components/EventCard";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { flushPending, getPending, saveScan } from "@/lib/offline";

const REGION_ID = "qr-scan-region";

export function Scanner({ events, servantId }: { events: EventRow[]; servantId: string }) {
  const queryClient = useQueryClient();
  const [eventId, setEventId] = useState(events[0]?.id ?? "");
  const [scanning, setScanning] = useState(false);
  const [pending, setPending] = useState(0);
  const scannerRef = useRef<{ stop: () => Promise<void>; clear: () => void } | null>(null);
  const lastRef = useRef<string>("");

  useEffect(() => {
    setPending(getPending().length);
    const onOnline = () => {
      void flushPending().then((n) => {
        setPending(getPending().length);
        if (n > 0) {
          toast.success(`تمت مزامنة ${n} تسجيل حضور`);
          void queryClient.invalidateQueries({ queryKey: ["attendance"] });
        }
      });
    };
    window.addEventListener("online", onOnline);
    onOnline();
    return () => window.removeEventListener("online", onOnline);
  }, [queryClient]);

  useEffect(() => {
    return () => {
      void scannerRef.current?.stop().catch(() => undefined);
    };
  }, []);

  const handleCode = async (studentId: string) => {
    if (!eventId) {
      toast.error("اختر الحدث أولاً");
      return;
    }
    if (lastRef.current === studentId) return;
    lastRef.current = studentId;
    setTimeout(() => (lastRef.current = ""), 3000);

    const result = await saveScan({
      event_id: eventId,
      student_id: studentId,
      scanned_by: servantId,
      scanned_at: new Date().toISOString(),
    });
    if (result === "saved") toast.success("تم تسجيل الحضور");
    else if (result === "duplicate") toast.info("الحضور مسجل بالفعل");
    else {
      toast.warning("تم الحفظ محلياً وسيتم المزامنة لاحقاً");
      setPending(getPending().length);
    }
    void queryClient.invalidateQueries({ queryKey: ["attendance"] });
  };

  const start = async () => {
    if (!eventId) {
      toast.error("اختر الحدث أولاً");
      return;
    }
    setScanning(true);
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode(REGION_ID);
      scannerRef.current = scanner as unknown as { stop: () => Promise<void>; clear: () => void };
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decoded) => void handleCode(decoded.trim()),
        () => undefined,
      );
    } catch {
      setScanning(false);
      toast.error("تعذر تشغيل الكاميرا، تأكد من السماح بالوصول");
    }
  };

  const stop = async () => {
    try {
      await scannerRef.current?.stop();
      scannerRef.current?.clear();
    } catch {
      /* already stopped */
    }
    scannerRef.current = null;
    setScanning(false);
  };

  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <Label>الحدث</Label>
        <Select value={eventId} onValueChange={setEventId}>
          <SelectTrigger className="h-12 w-full bg-elevated">
            <SelectValue placeholder="اختر الحدث" />
          </SelectTrigger>
          <SelectContent>
            {events.map((e) => (
              <SelectItem key={e.id} value={e.id}>
                {e.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div
        id={REGION_ID}
        className="aspect-square w-full overflow-hidden rounded-2xl bg-card"
        aria-label="منطقة مسح الكود"
      />

      {scanning ? (
        <Button variant="destructive" className="h-12 w-full rounded-full font-bold" onClick={() => void stop()}>
          إيقاف المسح
        </Button>
      ) : (
        <Button className="h-12 w-full rounded-full font-bold glow-primary" onClick={() => void start()}>
          <ScanLine className="size-5" />
          بدء مسح الكود
        </Button>
      )}

      {pending > 0 && (
        <p className="flex flex-row-reverse items-center justify-center gap-2 rounded-xl bg-card p-3 text-xs text-warning">
          <CloudUpload className="size-4" />
          {pending} تسجيل بانتظار المزامنة
        </p>
      )}
    </section>
  );
}
