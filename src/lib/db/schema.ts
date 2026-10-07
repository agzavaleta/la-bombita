import type { DBSchema } from "idb"

import { APP_STATE_KEYS, INDEX_NAMES, STORE_NAMES } from "@/lib/db/constants"
import type { DailyPrize } from "@/types/daily-prize"
import type { Prize } from "@/types/prize"

export type AppStateRecord = {
  key: (typeof APP_STATE_KEYS)[keyof typeof APP_STATE_KEYS]
  value: DailyPrize
}

export interface LaBombitaDatabase extends DBSchema {
  [STORE_NAMES.prizes]: {
    key: string
    value: Prize
    indexes: {
      [INDEX_NAMES.prizeNormalizedName]: string
    }
  }
  [STORE_NAMES.appState]: {
    key: AppStateRecord["key"]
    value: AppStateRecord
  }
}
