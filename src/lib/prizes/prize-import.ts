import { INDEX_NAMES, STORE_NAMES } from "@/lib/db/constants"
import { getDatabase } from "@/lib/db/database"
import type { NormalizedPrizeName } from "@/lib/prizes/normalize-prize-name"
import { createPrizeRecord } from "@/lib/prizes/prize-record"

export type PrizeImportResult = {
  added: number
  skipped: number
}

export async function addImportedPrizes(prizeNames: NormalizedPrizeName[]): Promise<PrizeImportResult> {
  const database = await getDatabase()
  const transaction = database.transaction(STORE_NAMES.prizes, "readwrite")
  const prizeStore = transaction.objectStore(STORE_NAMES.prizes)
  const normalizedNameIndex = prizeStore.index(INDEX_NAMES.prizeNormalizedName)
  let added = 0
  let skipped = 0

  for (const prizeName of prizeNames) {
    const existingPrize = await normalizedNameIndex.get(prizeName.normalizedName)

    if (existingPrize) {
      skipped += 1
    } else {
      await prizeStore.add(createPrizeRecord(prizeName))
      added += 1
    }
  }

  await transaction.done
  return { added, skipped }
}

export async function replacePrizes(prizeNames: NormalizedPrizeName[]): Promise<number> {
  const database = await getDatabase()
  const transaction = database.transaction(STORE_NAMES.prizes, "readwrite")
  const prizeStore = transaction.objectStore(STORE_NAMES.prizes)

  await prizeStore.clear()

  for (const prizeName of prizeNames) {
    await prizeStore.add(createPrizeRecord(prizeName))
  }

  await transaction.done
  return prizeNames.length
}
