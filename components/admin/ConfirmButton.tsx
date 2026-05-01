"use client";

import { cn } from "@/lib/utils";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  prompt: string;
}

/**
 * A submit button that shows a browser confirm() before submitting its parent form.
 * Used for destructive admin actions (delete school / deadline / open day).
 */
export function ConfirmButton({ prompt, onClick, className, children, ...rest }: Props) {
  return (
    <button
      {...rest}
      type="submit"
      className={cn(className)}
      onClick={(e) => {
        if (!confirm(prompt)) {
          e.preventDefault();
          return;
        }
        onClick?.(e);
      }}
    >
      {children}
    </button>
  );
}
