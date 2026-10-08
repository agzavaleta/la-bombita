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
import type { Prize } from "@/types/prize"

type DeletePrizeDialogProps = {
  prize: Prize
  onCancel: () => void
  onDelete: () => Promise<void>
}

export function DeletePrizeDialog({ onCancel, onDelete, prize }: DeletePrizeDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    setIsDeleting(true)

    try {
      await onDelete()
      toast.success("Premio eliminado")
      onCancel()
    } catch {
      toast.error("No se pudo eliminar el premio. Inténtalo nuevamente.")
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open onOpenChange={(open) => !open && !isDeleting && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar premio?</AlertDialogTitle>
          <AlertDialogDescription>
            Este premio dejará de estar disponible para futuros sorteos.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <p className="mt-4 break-words rounded-lg bg-brand-subtle p-3 text-sm font-bold text-text-primary">{prize.name}</p>
        <AlertDialogFooter>
          <AlertDialogCancel className="h-11" disabled={isDeleting}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            className="h-11 bg-destructive hover:bg-destructive/90"
            disabled={isDeleting}
            onClick={(event) => {
              event.preventDefault()
              void handleDelete()
            }}
          >
            {isDeleting ? "Eliminando…" : "Eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
