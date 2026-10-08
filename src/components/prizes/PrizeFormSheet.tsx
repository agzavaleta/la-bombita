import { useId, useState, type FormEvent } from "react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { PRIZE_ERROR_CODES, PrizeDomainError } from "@/lib/prizes/prize-errors"
import type { Prize } from "@/types/prize"

type PrizeFormSheetProps = {
  prize: Prize | null
  onClose: () => void
  onSave: (name: string) => Promise<void>
}

function getFieldError(error: unknown): string | null {
  if (!(error instanceof PrizeDomainError)) {
    return null
  }

  if (error.code === PRIZE_ERROR_CODES.nameRequired) {
    return "Ingresa un nombre para el premio."
  }

  if (error.code === PRIZE_ERROR_CODES.nameDuplicate) {
    return "Ya existe un premio con este nombre."
  }

  return null
}

export function PrizeFormSheet({ onClose, onSave, prize }: PrizeFormSheetProps) {
  const [name, setName] = useState(prize?.name ?? "")
  const [fieldError, setFieldError] = useState<string>()
  const [isSaving, setIsSaving] = useState(false)
  const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false)
  const inputId = useId()
  const errorId = `${inputId}-error`
  const initialName = prize?.name ?? ""
  const isEditing = prize !== null
  const hasUnsavedChanges = name !== initialName

  function requestClose() {
    if (isSaving) {
      return
    }

    if (hasUnsavedChanges) {
      setIsDiscardDialogOpen(true)
      return
    }

    onClose()
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFieldError(undefined)
    setIsSaving(true)

    try {
      await onSave(name)
      toast.success(isEditing ? "Premio actualizado" : "Premio agregado")
      onClose()
    } catch (error) {
      const expectedError = getFieldError(error)

      if (expectedError) {
        setFieldError(expectedError)
      } else {
        toast.error("No se pudo guardar el premio. Inténtalo nuevamente.")
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <Sheet open onOpenChange={(open) => !open && requestClose()}>
        <SheetContent className="mx-auto max-w-md pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <SheetHeader>
            <SheetTitle>{isEditing ? "Editar premio" : "Agregar premio"}</SheetTitle>
            <SheetDescription>
              {isEditing ? "Actualiza el nombre de este premio." : "Agrega un premio a tu universo."}
            </SheetDescription>
          </SheetHeader>

          <form
            className="mt-6"
            noValidate
            onSubmit={(event) => {
              void handleSubmit(event)
            }}
          >
            <div className="space-y-2">
              <Label htmlFor={inputId}>Nombre del premio</Label>
              <Input
                id={inputId}
                name="prizeName"
                value={name}
                autoComplete="off"
                autoFocus
                aria-invalid={fieldError ? true : undefined}
                aria-describedby={fieldError ? errorId : undefined}
                className={fieldError ? "border-destructive focus-visible:ring-destructive" : undefined}
                disabled={isSaving}
                onChange={(event) => {
                  setName(event.target.value)
                  setFieldError(undefined)
                }}
              />
              {fieldError ? (
                <p id={errorId} role="alert" className="text-sm font-semibold text-destructive">
                  {fieldError}
                </p>
              ) : null}
            </div>

            <SheetFooter className="grid grid-cols-2">
              <Button type="button" size="lg" variant="outline" disabled={isSaving} onClick={requestClose}>
                Cancelar
              </Button>
              <Button type="submit" size="lg" disabled={isSaving}>
                {isSaving ? "Guardando…" : "Guardar"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <AlertDialog open={isDiscardDialogOpen} onOpenChange={setIsDiscardDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Descartar cambios?</AlertDialogTitle>
            <AlertDialogDescription>Los cambios realizados no se guardarán.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-11">Seguir editando</AlertDialogCancel>
            <AlertDialogAction className="h-11" onClick={onClose}>
              Descartar cambios
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
