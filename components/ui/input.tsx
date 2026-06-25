import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full border border-brand-lightGrey bg-white px-3 py-2 text-sm outline-none focus:border-brand-accent",
        className
      )}
      {...props}
    />
  );
}
