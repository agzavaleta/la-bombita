import { Toaster as Sonner, type ToasterProps } from "sonner"

function Toaster(props: ToasterProps) {
  return (
    <Sonner
      position="top-center"
      richColors
      theme="dark"
      toastOptions={{
        classNames: {
          toast: "font-sans border-border bg-surface-elevated text-text-primary",
          description: "text-text-secondary",
          actionButton: "bg-primary text-background",
          cancelButton: "bg-primary-soft text-text-primary",
          success: "border-success/60",
          warning: "border-warning/60",
          error: "border-destructive/60",
          info: "border-primary-border",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
