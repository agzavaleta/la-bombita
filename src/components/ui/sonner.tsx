import { Toaster as Sonner, type ToasterProps } from "sonner"

function Toaster(props: ToasterProps) {
  return (
    <Sonner
      position="top-center"
      toastOptions={{
        classNames: {
          toast: "font-sans border-border bg-surface text-text-primary",
          description: "text-text-secondary",
          actionButton: "bg-brand text-white",
          cancelButton: "bg-brand-soft text-brand-active",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
