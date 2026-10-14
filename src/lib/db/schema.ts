import type { DBSchema } from "idb"

import { APP_STATE_KEYS, INDEX_NAMES, STORE_NAMES } from "@/lib/db/constants"
import type { DailyPrize } from "@/types/daily-prize"
import type { Prize } from "@/types/prize"

type DailyPrizeStateRecord = {
  key: typeof APP_STATE_KEYS.currentDailyPrize
  value: DailyPrize
}

type SoundPreferenceStateRecord = {
  key: typeof APP_STATE_KEYS.soundEnabled
  value: boolean
}

export type AppStateRecord = DailyPrizeStateRecord | SoundPreferenceStateRecord

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
