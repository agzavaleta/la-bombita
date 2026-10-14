import { Gift, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"

type PrizesEmptyStateProps = {
  onAdd: () => void
}

export function PrizesEmptyState({ onAdd }: PrizesEmptyStateProps) {
  return (
    <div className="flex flex-col items-center px-6 py-10 text-center">
      <div className="relative mb-4 size-14">
        <span aria-hidden="true" className="soft-glow soft-glow--small" />
        <div className="relative flex size-14 items-center justify-center rounded-full border border-primary-border bg-primary-soft text-primary-accent">
          <Gift aria-hidden="true" className="size-7" />
        </div>
      </div>
      <h2 className="text-xl font-extrabold">Aún no tienes premios</h2>
      <p className="mt-2 text-sm text-text-secondary">Agrega tu primer premio para comenzar.</p>
      <Button type="button" size="lg" className="mt-6 w-full" onClick={onAdd}>
        <Plus aria-hidden="true" className="size-5" />
        Agregar premio
      </Button>
    </div>
  )
}
