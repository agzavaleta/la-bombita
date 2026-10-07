import { cn } from "@/lib/utils"

type TulinPlaceholderProps = {
  className?: string
}

export function TulinPlaceholder({ className }: TulinPlaceholderProps) {
  return (
    <div className={cn("flex flex-col items-center", className)} aria-label="Placeholder provisional de Tulín Bombín">
      <div className="size-16 rounded-full border-4 border-slate-900 bg-amber-100" />
      <div className="-mt-1 h-20 w-16 rounded-t-3xl rounded-b-xl bg-red-600" />
      <span className="mt-2 rounded-full bg-white px-3 py-1 text-xs font-extrabold text-slate-900">Tulín</span>
    </div>
  )
}
