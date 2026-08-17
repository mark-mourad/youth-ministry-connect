import { supabase } from "@/integrations/supabase/client";

const KEY = "pending_attendance_v1";

export type PendingScan = {
  event_id: string;
  student_id: string;
  scanned_by: string;
  scanned_at: string;
};

export function getPending(): PendingScan[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "[]") as PendingScan[];
  } catch {
    return [];
  }
}

function setPending(items: PendingScan[]) {
  window.localStorage.setItem(KEY, JSON.stringify(items));
}

export function queueScan(scan: PendingScan) {
  setPending([...getPending(), scan]);
}

/** Try to save now; queue locally when offline or the request fails. */
export async function saveScan(scan: PendingScan): Promise<"saved" | "queued" | "duplicate"> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    queueScan(scan);
    return "queued";
  }
  const { error } = await supabase.from("attendance").insert(scan);
  if (!error) return "saved";
  if (error.code === "23505") return "duplicate";
  queueScan(scan);
  return "queued";
}

export async function flushPending(): Promise<number> {
  const pending = getPending();
  if (pending.length === 0) return 0;
  const remaining: PendingScan[] = [];
  let synced = 0;
  for (const scan of pending) {
    const { error } = await supabase.from("attendance").insert(scan);
    if (error && error.code !== "23505") remaining.push(scan);
    else synced += 1;
  }
  setPending(remaining);
  return synced;
}
