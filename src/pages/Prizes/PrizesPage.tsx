import { Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { DeletePrizeDialog } from "@/components/prizes/DeletePrizeDialog"
import { PrizeCard } from "@/components/prizes/PrizeCard"
import { PrizeFormSheet } from "@/components/prizes/PrizeFormSheet"
import { PrizesEmptyState } from "@/components/prizes/PrizesEmptyState"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { usePrizes } from "@/hooks/use-prizes"
import type { Prize } from "@/types/prize"

type PrizesPageProps = {
  openCreateOnMount?: boolean
}

export function PrizesPage({ openCreateOnMount = false }: PrizesPageProps) {
  const { addPrize, editPrize, isLoading, loadError, prizes, removePrize } = usePrizes()
  const [formPrize, setFormPrize] = useState<Prize | null | undefined>(openCreateOnMount ? null : undefined)
  const [prizeToDelete, setPrizeToDelete] = useState<Prize>()
  const prizeCountLabel = `${prizes.length} ${prizes.length === 1 ? "premio" : "premios"}`

  useEffect(() => {
    if (loadError) {
      toast.error("No se pudieron cargar los premios. Inténtalo nuevamente.")
    }
  }, [loadError])

  async function savePrize(name: string) {
    if (formPrize) {
      await editPrize(formPrize.id, name)
      return
    }

    await addPrize(name)
  }

  return (
    <section aria-labelledby="prizes-title" className="space-y-6">
      <header className="space-y-1">
        <h1 id="prizes-title" className="text-3xl font-extrabold tracking-tight">
          Mis premios
        </h1>
        <p className="text-sm font-semibold text-slate-500" aria-live="polite">
          {prizeCountLabel}
        </p>
      </header>

      {!isLoading && prizes.length > 0 ? (
        <Button type="button" size="lg" className="w-full" onClick={() => setFormPrize(null)}>
          <Plus aria-hidden="true" className="size-5" />
          Agregar premio
        </Button>
      ) : null}

      {isLoading ? (
        <Card aria-live="polite">
          <CardContent className="p-6 text-center text-sm text-slate-500">Cargando premios…</CardContent>
        </Card>
      ) : prizes.length === 0 ? (
        <PrizesEmptyState onAdd={() => setFormPrize(null)} />
      ) : (
        <ul className="space-y-3">
          {prizes.map((prize) => (
            <li key={prize.id}>
              <PrizeCard prize={prize} onEdit={setFormPrize} onDelete={setPrizeToDelete} />
            </li>
          ))}
        </ul>
      )}

      {formPrize !== undefined ? (
        <PrizeFormSheet
          key={formPrize?.id ?? "new-prize"}
          prize={formPrize}
          onClose={() => setFormPrize(undefined)}
          onSave={savePrize}
        />
      ) : null}

      {prizeToDelete ? (
        <DeletePrizeDialog
          prize={prizeToDelete}
          onCancel={() => setPrizeToDelete(undefined)}
          onDelete={() => removePrize(prizeToDelete.id)}
        />
      ) : null}
    </section>
  )
}
