import { Plus } from "lucide-react"

import tulinEmptyState from "@/assets/tulin/tulin-empty-state.png"
import { Button } from "@/components/ui/button"

type HomeEmptyStateProps = {
  onAddFirstPrize: () => void
}

export function HomeEmptyState({ onAddFirstPrize }: HomeEmptyStateProps) {
  return (
    <div className="flex w-full max-w-sm flex-col items-center px-6 py-9 text-center">
      <div className="relative flex h-48 w-48 items-center justify-center">
        <span aria-hidden="true" className="soft-glow soft-glow--brand" />
        <img alt="Tulín Bombín" className="relative size-full object-contain" src={tulinEmptyState} />
      </div>
      <h2 className="mt-6 text-xl font-extrabold">Aún no tienes premios</h2>
      <p className="mt-2 text-sm text-text-secondary">Agrega tu primer premio para comenzar.</p>
      <Button type="button" size="lg" className="mt-6 w-full" onClick={onAddFirstPrize}>
        <Plus aria-hidden="true" className="size-5" />
        Agregar mi primer premio
      </Button>
    </div>
  )
}
