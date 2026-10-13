import { Plus } from "lucide-react"

import tulinStanding from "@/assets/tulin/tulin-standing.png"
import { Button } from "@/components/ui/button"

type HomeEmptyStateProps = {
  onAddFirstPrize: () => void
}

export function HomeEmptyState({ onAddFirstPrize }: HomeEmptyStateProps) {
  return (
    <div className="flex w-full max-w-sm flex-col items-center px-6 py-9 text-center">
      <img alt="Tulín Bombín" className="h-40 w-40 object-contain" src={tulinStanding} />
      <h2 className="mt-6 text-xl font-extrabold">Aún no tienes premios</h2>
      <p className="mt-2 text-sm text-text-secondary">Agrega tu primer premio para comenzar.</p>
      <Button type="button" size="lg" className="mt-6 w-full" onClick={onAddFirstPrize}>
        <Plus aria-hidden="true" className="size-5" />
        Agregar mi primer premio
      </Button>
    </div>
  )
}
