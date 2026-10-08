import { Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { Prize } from "@/types/prize"

type PrizeCardProps = {
  prize: Prize
  onEdit: (prize: Prize) => void
  onDelete: (prize: Prize) => void
}

export function PrizeCard({ onDelete, onEdit, prize }: PrizeCardProps) {
  return (
    <Card>
      <CardContent className="space-y-4 p-4">
        <p className="break-words text-base font-bold leading-snug text-slate-900">{prize.name}</p>
        <div className="grid grid-cols-2 gap-2">
          <Button type="button" variant="outline" className="h-11" onClick={() => onEdit(prize)}>
            <Pencil aria-hidden="true" className="size-4" />
            Editar
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-11 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => onDelete(prize)}
          >
            <Trash2 aria-hidden="true" className="size-4" />
            Eliminar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
