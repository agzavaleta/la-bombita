import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 text-base text-text-primary outline-none placeholder:text-text-muted focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:bg-disabled disabled:text-text-muted disabled:opacity-70",
        className,
      )}
      {...props}
    />
  )
}

export { Input }
