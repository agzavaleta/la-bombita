export const PRIZE_ERROR_CODES = {
  nameRequired: "PRIZE_NAME_REQUIRED",
  nameDuplicate: "PRIZE_NAME_DUPLICATE",
  notFound: "PRIZE_NOT_FOUND",
} as const

export type PrizeErrorCode = (typeof PRIZE_ERROR_CODES)[keyof typeof PRIZE_ERROR_CODES]

export class PrizeDomainError extends Error {
  readonly code: PrizeErrorCode

  constructor(code: PrizeErrorCode) {
    super(code)
    this.name = "PrizeDomainError"
    this.code = code
  }
}
