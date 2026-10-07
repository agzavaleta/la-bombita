export const DATABASE_NAME = "la-bombita"
export const DATABASE_VERSION = 1

export const STORE_NAMES = {
  prizes: "prizes",
  appState: "app-state",
} as const

export const INDEX_NAMES = {
  prizeNormalizedName: "by-normalized-name",
} as const

export const APP_STATE_KEYS = {
  currentDailyPrize: "current-daily-prize",
} as const
