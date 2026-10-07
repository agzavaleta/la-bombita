import type { NormalizedPrizeName } from "@/lib/prizes/normalize-prize-name"
import type { Prize } from "@/types/prize"

export function createPrizeRecord(prizeName: NormalizedPrizeName, timestamp = new Date().toISOString()): Prize {
  return {
    id: crypto.randomUUID(),
    name: prizeName.name,
    normalizedName: prizeName.normalizedName,
    createdAt: timestamp,
    updatedAt: timestamp,
  }
}
