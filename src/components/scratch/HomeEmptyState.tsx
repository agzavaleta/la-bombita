import { Plus } from "lucide-react"

import { TulinPlaceholder } from "@/components/scratch/TulinPlaceholder"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

type HomeEmptyStateProps = {
  onAddFirstPrize: () => void
}

export function HomeEmptyState({ onAddFirstPrize }: HomeEmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center px-6 py-9 text-center">
        <TulinPlaceholder />
        <h2 className="mt-6 text-xl font-extrabold">Aún no tienes premios</h2>
        <p className="mt-2 text-sm text-slate-500">Agrega tu primer premio para comenzar.</p>
        <Button type="button" size="lg" className="mt-6 w-full" onClick={onAddFirstPrize}>
          <Plus aria-hidden="true" className="size-5" />
          Agregar mi primer premio
        </Button>
      </CardContent>
    </Card>
  )
}
