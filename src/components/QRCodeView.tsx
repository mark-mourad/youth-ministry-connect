import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function QRCodeView({
  value,
  size = 220,
  className,
}: {
  value: string;
  size?: number;
  className?: string;
}) {
  const [src, setSrc] = useState<string>("");

  useEffect(() => {
    let active = true;
    void QRCode.toDataURL(value, {
      width: size * 2,
      margin: 1,
      color: { dark: "#000000", light: "#ffffff" },
    }).then((url) => {
      if (active) setSrc(url);
    });
    return () => {
      active = false;
    };
  }, [value, size]);

  if (!src) {
    return (
      <div
        className="animate-pulse rounded-xl bg-muted"
        style={{ width: size, height: size }}
        aria-hidden
      />
    );
  }

  return (
    <img
      src={src}
      width={size}
      height={size}
      alt="كود الحضور الشخصي"
      className={className ?? "rounded-xl bg-white p-2"}
    />
  );
}
