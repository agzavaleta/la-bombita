import { useState } from "react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import type { ParsedPrizeBackup } from "@/lib/backup/prize-backup"
import { addImportedPrizes, replacePrizes } from "@/lib/prizes/prize-import"

type PrizeImportSheetProps = {
  backup: ParsedPrizeBackup
  fileName: string
  onClose: () => void
}

function getPrizeCountLabel(count: number): string {
  return `${count} ${count === 1 ? "premio" : "premios"}`
}

export function PrizeImportSheet({ backup, fileName, onClose }: PrizeImportSheetProps) {
  const [isReplacing, setIsReplacing] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  async function handleAdd() {
    setIsImporting(true)

    try {
      const result = await addImportedPrizes(backup.prizes)
      const title = result.added === 0 ? "No se agregaron premios nuevos" : `${getPrizeCountLabel(result.added)} agregados`
      const description = result.skipped > 0 ? `${getPrizeCountLabel(result.skipped)} existentes fueron omitidos.` : undefined
      toast.success(title, { description })
      onClose()
    } catch {
      toast.error("No se pudieron agregar los premios. Inténtalo nuevamente.")
      setIsImporting(false)
    }
  }

  async function handleReplace() {
    setIsImporting(true)

    try {
      const importedCount = await replacePrizes(backup.prizes)
      toast.success("Premios reemplazados", {
        description: `${getPrizeCountLabel(importedCount)} importados.`,
      })
      onClose()
    } catch {
      toast.error("No se pudieron reemplazar los premios. Inténtalo nuevamente.")
      setIsImporting(false)
      setIsReplacing(false)
    }
  }

  return (
    <>
      <Sheet open onOpenChange={(open) => !open && !isImporting && onClose()}>
        <SheetContent className="mx-auto max-w-md pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <SheetHeader>
            <SheetTitle>Importar premios</SheetTitle>
            <SheetDescription>Elige cómo incorporar los premios del respaldo.</SheetDescription>
          </SheetHeader>

          <div className="mt-6 rounded-xl bg-red-50 p-4">
            <p className="break-all text-sm font-bold text-slate-900">{fileName}</p>
            <p className="mt-1 text-sm text-slate-500">{getPrizeCountLabel(backup.prizes.length)} validados</p>
          </div>

          <SheetFooter>
            <Button type="button" size="lg" variant="outline" disabled={isImporting} onClick={() => setIsReplacing(true)}>
              Reemplazar mis premios
            </Button>
            <Button
              type="button"
              size="lg"
              disabled={isImporting}
              onClick={() => {
                void handleAdd()
              }}
            >
              {isImporting ? "Importando…" : "Agregar a mis premios"}
            </Button>
            <Button type="button" size="lg" variant="ghost" disabled={isImporting} onClick={onClose}>
              Cancelar
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <AlertDialog open={isReplacing} onOpenChange={setIsReplacing}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Reemplazar mis premios?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminarán tus premios actuales y quedarán únicamente los del respaldo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-11" disabled={isImporting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="h-11 bg-rose-600 hover:bg-rose-700"
              disabled={isImporting}
              onClick={(event) => {
                event.preventDefault()
                void handleReplace()
              }}
            >
              {isImporting ? "Reemplazando…" : "Reemplazar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
