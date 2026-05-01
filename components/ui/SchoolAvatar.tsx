import Image from "next/image";
import { cn, initialsOf } from "@/lib/utils";

interface Props {
  name: string;
  logoUrl?: string | null;
  size?: number;
  className?: string;
}

export function SchoolAvatar({ name, logoUrl, size = 48, className }: Props) {
  if (logoUrl) {
    return (
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-lg bg-white ring-1 ring-navy/10",
          className,
        )}
        style={{ width: size, height: size }}
      >
        <Image
          src={logoUrl}
          alt={`${name} logo`}
          fill
          sizes={`${size}px`}
          className="object-contain p-1"
        />
      </div>
    );
  }
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg bg-navy text-cream",
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.35 }}
      aria-label={name}
    >
      <span className="font-serif font-semibold">{initialsOf(name)}</span>
    </div>
  );
}
