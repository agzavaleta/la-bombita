import { BookOpen, Download, RotateCcw, Upload } from "lucide-react"
import { useRef, useState, type ChangeEvent } from "react"
import { toast } from "sonner"

import { DailyPrizeResetDialog } from "@/components/settings/DailyPrizeResetDialog"
import { PrizeImportSheet } from "@/components/settings/PrizeImportSheet"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { BACKUP_FILE_NAME } from "@/lib/backup/backup-constants"
import { BACKUP_ERROR_CODES, BackupValidationError } from "@/lib/backup/backup-errors"
import {
  createPrizeBackup,
  parsePrizeBackup,
  serializePrizeBackup,
  type ParsedPrizeBackup,
} from "@/lib/backup/prize-backup"
import { APP_VERSION } from "@/lib/version/app-version"

type SettingsPageProps = {
  onOpenTulinStory: () => void
}

type PendingImport = {
  backup: ParsedPrizeBackup
  fileName: string
}

function getBackupErrorMessage(error: BackupValidationError): string {
  if (error.code === BACKUP_ERROR_CODES.invalidJson) {
    return "El archivo no contiene un JSON válido."
  }

  if (error.code === BACKUP_ERROR_CODES.unsupportedVersion) {
    return "La versión de este respaldo no es compatible."
  }

  if (error.code === BACKUP_ERROR_CODES.nameRequired) {
    return "El respaldo contiene un premio sin nombre."
  }

  if (error.code === BACKUP_ERROR_CODES.duplicateName) {
    return "El respaldo contiene nombres de premios duplicados."
  }

  return "El archivo no tiene el formato de respaldo esperado."
}

function downloadJsonFile(contents: string): void {
  const downloadUrl = URL.createObjectURL(new Blob([contents], { type: "application/json" }))
  const link = document.createElement("a")
  link.href = downloadUrl
  link.download = BACKUP_FILE_NAME
  document.body.append(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 0)
}

export function SettingsPage({ onOpenTulinStory }: SettingsPageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pendingImport, setPendingImport] = useState<PendingImport>()
  const [isExporting, setIsExporting] = useState(false)
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)

  async function handleExport() {
    setIsExporting(true)

    try {
      const backup = await createPrizeBackup()
      downloadJsonFile(serializePrizeBackup(backup))
      toast.success("Respaldo exportado")
    } catch {
      toast.error("No se pudo exportar el respaldo. Inténtalo nuevamente.")
    } finally {
      setIsExporting(false)
    }
  }

  async function handleFileSelection(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""

    if (!file) {
      return
    }

    try {
      const backup = parsePrizeBackup(await file.text())
      setPendingImport({ backup, fileName: file.name })
    } catch (error) {
      if (error instanceof BackupValidationError) {
        toast.error(getBackupErrorMessage(error))
      } else {
        toast.error("No se pudo leer el archivo seleccionado.")
      }
    }
  }

  return (
    <section aria-labelledby="settings-title" className="space-y-6">
      <h1 id="settings-title" className="text-3xl font-extrabold tracking-tight">
        Ajustes
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Respaldo</CardTitle>
          <CardDescription>Guarda o recupera únicamente tu lista de premios.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            type="button"
            size="lg"
            className="w-full"
            disabled={isExporting}
            onClick={() => {
              void handleExport()
            }}
          >
            <Download aria-hidden="true" className="size-5" />
            {isExporting ? "Exportando…" : "Exportar premios"}
          </Button>
          <Button type="button" size="lg" variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
            <Upload aria-hidden="true" className="size-5" />
            Importar premios
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            aria-label="Seleccionar respaldo de premios"
            onChange={(event) => {
              void handleFileSelection(event)
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tulín Bombín</CardTitle>
        </CardHeader>
        <CardContent>
          <Button type="button" size="lg" variant="outline" className="w-full" onClick={onOpenTulinStory}>
            <BookOpen aria-hidden="true" className="size-5" />
            Conoce la historia de Tulín
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Herramientas de desarrollo</CardTitle>
          <CardDescription>Temporal · solo desarrollo. Debe retirarse antes de la versión final.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            size="lg"
            variant="outline"
            className="w-full"
            onClick={() => setIsResetDialogOpen(true)}
          >
            <RotateCcw aria-hidden="true" className="size-5" />
            Reiniciar premio del día
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Acerca de</CardTitle>
        </CardHeader>
        <CardContent>
          <Separator className="mb-4" />
          <p className="text-sm font-bold text-slate-500">Versión {APP_VERSION}</p>
        </CardContent>
      </Card>

      {pendingImport ? (
        <PrizeImportSheet
          backup={pendingImport.backup}
          fileName={pendingImport.fileName}
          onClose={() => setPendingImport(undefined)}
        />
      ) : null}

      {isResetDialogOpen ? <DailyPrizeResetDialog onClose={() => setIsResetDialogOpen(false)} /> : null}
    </section>
  )
}
