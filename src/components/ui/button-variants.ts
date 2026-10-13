import { cva } from "class-variance-authority"

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:bg-disabled disabled:text-text-muted disabled:opacity-70",
  {
    variants: {
      variant: {
        default: "bg-primary text-background hover:bg-primary-hover active:bg-primary-pressed",
        secondary: "border border-primary-border bg-primary-soft text-text-primary hover:bg-primary-soft-hover active:bg-primary-pressed",
        outline: "border border-border bg-surface-elevated text-text-primary hover:bg-muted active:bg-primary-soft",
        ghost: "text-text-primary hover:bg-surface-elevated active:bg-primary-soft",
        destructive: "bg-destructive text-background hover:bg-primary-hover active:bg-primary-pressed",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 px-6",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)
