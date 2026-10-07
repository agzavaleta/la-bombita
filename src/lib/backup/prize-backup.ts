import { BACKUP_APP_NAME, BACKUP_VERSION } from "@/lib/backup/backup-constants"
import { BACKUP_ERROR_CODES, BackupValidationError } from "@/lib/backup/backup-errors"
import { normalizePrizeName, type NormalizedPrizeName } from "@/lib/prizes/normalize-prize-name"
import { getPrizes } from "@/lib/prizes/prize-repository"

export type PrizeBackupFile = {
  app: typeof BACKUP_APP_NAME
  backupVersion: typeof BACKUP_VERSION
  premios: Array<{
    nombre: string
  }>
}

export type ParsedPrizeBackup = {
  prizes: NormalizedPrizeName[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

export async function createPrizeBackup(): Promise<PrizeBackupFile> {
  const prizes = await getPrizes()

  return {
    app: BACKUP_APP_NAME,
    backupVersion: BACKUP_VERSION,
    premios: prizes.map((prize) => ({ nombre: prize.name })),
  }
}

export function serializePrizeBackup(backup: PrizeBackupFile): string {
  return `${JSON.stringify(backup, null, 2)}\n`
}

export function parsePrizeBackup(contents: string): ParsedPrizeBackup {
  let rawBackup: unknown

  try {
    rawBackup = JSON.parse(contents) as unknown
  } catch {
    throw new BackupValidationError(BACKUP_ERROR_CODES.invalidJson)
  }

  if (!isRecord(rawBackup) || rawBackup.app !== BACKUP_APP_NAME || !Array.isArray(rawBackup.premios)) {
    throw new BackupValidationError(BACKUP_ERROR_CODES.invalidStructure)
  }

  if (rawBackup.backupVersion !== BACKUP_VERSION) {
    throw new BackupValidationError(BACKUP_ERROR_CODES.unsupportedVersion)
  }

  const normalizedNames = new Set<string>()
  const prizes = rawBackup.premios.map((rawPrize) => {
    if (!isRecord(rawPrize) || typeof rawPrize.nombre !== "string") {
      throw new BackupValidationError(BACKUP_ERROR_CODES.invalidStructure)
    }

    const prizeName = normalizePrizeName(rawPrize.nombre)

    if (prizeName.name.length === 0) {
      throw new BackupValidationError(BACKUP_ERROR_CODES.nameRequired)
    }

    if (normalizedNames.has(prizeName.normalizedName)) {
      throw new BackupValidationError(BACKUP_ERROR_CODES.duplicateName)
    }

    normalizedNames.add(prizeName.normalizedName)
    return prizeName
  })

  return { prizes }
}
