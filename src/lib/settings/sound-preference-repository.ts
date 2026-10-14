import { APP_STATE_KEYS, STORE_NAMES } from "@/lib/db/constants"
import { getDatabase } from "@/lib/db/database"
import type { AppStateRecord } from "@/lib/db/schema"

export async function getSoundEnabled(): Promise<boolean> {
  const database = await getDatabase()
  const record = await database.get(STORE_NAMES.appState, APP_STATE_KEYS.soundEnabled)

  return record?.key === APP_STATE_KEYS.soundEnabled ? record.value : true
}

export async function saveSoundEnabled(soundEnabled: boolean): Promise<void> {
  const database = await getDatabase()
  const record: AppStateRecord = {
    key: APP_STATE_KEYS.soundEnabled,
    value: soundEnabled,
  }

  await database.put(STORE_NAMES.appState, record)
}
