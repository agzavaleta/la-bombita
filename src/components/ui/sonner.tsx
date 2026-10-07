import { Toaster as Sonner, type ToasterProps } from "sonner"

function Toaster(props: ToasterProps) {
  return (
    <Sonner
      position="top-center"
      toastOptions={{
        classNames: {
          toast: "font-sans border-slate-200 bg-white text-slate-900",
          description: "text-slate-500",
          actionButton: "bg-red-600 text-white",
          cancelButton: "bg-red-100 text-red-700",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
