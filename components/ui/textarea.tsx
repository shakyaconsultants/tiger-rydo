import * as React from "react";
import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "flex min-h-[100px] w-full border border-brand-lightGrey bg-white px-3 py-2 text-sm outline-none focus:border-brand-accent",
        className
      )}
      {...props}
    />
  );
}
