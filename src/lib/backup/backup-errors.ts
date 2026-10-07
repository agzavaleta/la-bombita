export const BACKUP_ERROR_CODES = {
  invalidJson: "BACKUP_INVALID_JSON",
  invalidStructure: "BACKUP_INVALID_STRUCTURE",
  unsupportedVersion: "BACKUP_UNSUPPORTED_VERSION",
  nameRequired: "BACKUP_NAME_REQUIRED",
  duplicateName: "BACKUP_DUPLICATE_NAME",
} as const

export type BackupErrorCode = (typeof BACKUP_ERROR_CODES)[keyof typeof BACKUP_ERROR_CODES]

export class BackupValidationError extends Error {
  readonly code: BackupErrorCode

  constructor(code: BackupErrorCode) {
    super(code)
    this.name = "BackupValidationError"
    this.code = code
  }
}
