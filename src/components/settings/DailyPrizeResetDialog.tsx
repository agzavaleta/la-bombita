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
import { clearCurrentDailyPrize } from "@/lib/daily-prize/daily-prize-repository"

type DailyPrizeResetDialogProps = {
  onClose: () => void
}

export function DailyPrizeResetDialog({ onClose }: DailyPrizeResetDialogProps) {
  const [isResetting, setIsResetting] = useState(false)

  async function handleReset() {
    setIsResetting(true)

    try {
      await clearCurrentDailyPrize()
      toast.success("Premio del día reiniciado")
      onClose()
    } catch {
      toast.error("No se pudo reiniciar el premio del día. Inténtalo nuevamente.")
      setIsResetting(false)
    }
  }

  return (
    <AlertDialog open onOpenChange={(open) => !open && !isResetting && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Reiniciar premio del día?</AlertDialogTitle>
          <AlertDialogDescription>
            Podrás volver a raspar la bomba como si aún no hubieras obtenido un premio hoy.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="h-11" disabled={isResetting}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            className="h-11"
            disabled={isResetting}
            onClick={(event) => {
              event.preventDefault()
              void handleReset()
            }}
          >
            {isResetting ? "Reiniciando…" : "Reiniciar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
