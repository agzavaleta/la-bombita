import { APP_STATE_KEYS, STORE_NAMES } from "@/lib/db/constants"
import { getDatabase } from "@/lib/db/database"
import type { AppStateRecord } from "@/lib/db/schema"
import type { DailyPrize } from "@/types/daily-prize"

export async function getCurrentDailyPrize(): Promise<DailyPrize | null> {
  const database = await getDatabase()
  const record = await database.get(STORE_NAMES.appState, APP_STATE_KEYS.currentDailyPrize)

  return record?.value ?? null
}

export async function saveCurrentDailyPrize(dailyPrize: DailyPrize): Promise<void> {
  const database = await getDatabase()
  const record: AppStateRecord = {
    key: APP_STATE_KEYS.currentDailyPrize,
    value: dailyPrize,
  }

  await database.put(STORE_NAMES.appState, record)
}

export async function clearCurrentDailyPrize(): Promise<void> {
  const database = await getDatabase()
  await database.delete(STORE_NAMES.appState, APP_STATE_KEYS.currentDailyPrize)
}
