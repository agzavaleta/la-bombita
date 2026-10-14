import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

type SwitchProps = Omit<ComponentProps<"button">, "onChange" | "onClick" | "role"> & {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

function Switch({ checked, className, disabled, onCheckedChange, ...props }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={cn(
        "inline-flex h-8 w-14 shrink-0 items-center rounded-full border border-border p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-primary" : "bg-disabled",
        className,
      )}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn(
          "block size-5 rounded-full bg-text-primary transition-transform",
          checked ? "translate-x-6" : "translate-x-0",
        )}
      />
    </button>
  )
}

export { Switch }
