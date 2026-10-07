import { Gift, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

type PrizesEmptyStateProps = {
  onAdd: () => void
}

export function PrizesEmptyState({ onAdd }: PrizesEmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center px-6 py-10 text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-violet-100 text-violet-700">
          <Gift aria-hidden="true" className="size-7" />
        </div>
        <h2 className="text-xl font-extrabold">Aún no tienes premios</h2>
        <p className="mt-2 text-sm text-slate-500">Agrega tu primer premio para comenzar.</p>
        <Button type="button" size="lg" className="mt-6 w-full" onClick={onAdd}>
          <Plus aria-hidden="true" className="size-5" />
          Agregar premio
        </Button>
      </CardContent>
    </Card>
  )
}
