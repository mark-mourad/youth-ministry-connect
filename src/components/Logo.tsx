import logo from "@/assets/thanwy-logo.jpg.asset.json";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <img
      src={logo.url}
      alt="شعار اجتماعات ثانوي"
      className={cn("rounded-full object-cover", className)}
    />
  );
}
