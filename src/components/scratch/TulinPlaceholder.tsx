import { cn } from "@/lib/utils"

type TulinPlaceholderProps = {
  className?: string
}

export function TulinPlaceholder({ className }: TulinPlaceholderProps) {
  return (
    <div className={cn("flex flex-col items-center", className)} aria-label="Placeholder provisional de Tulín Bombín">
      <div className="size-16 rounded-full border-4 border-text-primary bg-prize-soft" />
      <div className="-mt-1 h-20 w-16 rounded-t-3xl rounded-b-xl bg-brand" />
      <span className="mt-2 rounded-full bg-surface px-3 py-1 text-xs font-extrabold text-text-primary">Tulín</span>
    </div>
  )
}
