import { CalendarDays, Clock, MapPin } from "lucide-react";
import { eventTypeLabel } from "@/lib/constants";

export type EventRow = {
  id: string;
  title: string;
  event_type: string;
  start_time: string;
  end_time: string;
  recurrence: string;
  custom_days: string[] | null;
  grade_level: string | null;
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("ar-EG", { weekday: "long", day: "numeric", month: "long" });
const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });

export function EventCard({ event, footer }: { event: EventRow; footer?: React.ReactNode }) {
  return (
    <article className="card-edge min-w-[15rem] flex-1 p-4 pt-5">
      <div className="flex justify-end">
        <span className="rounded-md bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
          {eventTypeLabel(event.event_type)}
        </span>
      </div>
      <h3 className="mt-2 text-end text-sm font-bold">{event.title}</h3>
      <ul className="mt-3 space-y-1.5 text-end text-[11px] text-muted-foreground">
        <li className="flex flex-row-reverse items-center gap-1.5">
          <CalendarDays className="size-3.5 shrink-0 text-primary" />
          <span>{fmtDate(event.start_time)}</span>
        </li>
        <li className="flex flex-row-reverse items-center gap-1.5">
          <Clock className="size-3.5 shrink-0 text-primary" />
          <span>
            {fmtTime(event.start_time)} — {fmtTime(event.end_time)}
          </span>
        </li>
        <li className="flex flex-row-reverse items-center gap-1.5">
          <MapPin className="size-3.5 shrink-0 text-primary" />
          <span>
            {event.recurrence === "weekly"
              ? "أسبوعي"
              : event.recurrence === "custom"
                ? `${event.custom_days?.length ?? 0} مواعيد مخصصة`
                : "مرة واحدة"}
          </span>
        </li>
      </ul>
      {footer ? <div className="mt-3">{footer}</div> : null}
    </article>
  );
}
