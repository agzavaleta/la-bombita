import { INDEX_NAMES, STORE_NAMES } from "@/lib/db/constants"
import { getDatabase } from "@/lib/db/database"
import { normalizePrizeName } from "@/lib/prizes/normalize-prize-name"
import { PRIZE_ERROR_CODES, PrizeDomainError } from "@/lib/prizes/prize-errors"
import type { Prize } from "@/types/prize"

function isConstraintError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "ConstraintError"
}

function requirePrizeName(name: string): void {
  if (name.length === 0) {
    throw new PrizeDomainError(PRIZE_ERROR_CODES.nameRequired)
  }
}

export async function getPrizes(): Promise<Prize[]> {
  const database = await getDatabase()
  return database.getAll(STORE_NAMES.prizes)
}

export async function getPrizeById(id: string): Promise<Prize | null> {
  const database = await getDatabase()
  return (await database.get(STORE_NAMES.prizes, id)) ?? null
}

export async function createPrize(value: string): Promise<Prize> {
  const { name, normalizedName } = normalizePrizeName(value)
  requirePrizeName(name)

  const timestamp = new Date().toISOString()
  const prize: Prize = {
    id: crypto.randomUUID(),
    name,
    normalizedName,
    createdAt: timestamp,
    updatedAt: timestamp,
  }

  const database = await getDatabase()

  try {
    await database.add(STORE_NAMES.prizes, prize)
  } catch (error) {
    if (isConstraintError(error)) {
      throw new PrizeDomainError(PRIZE_ERROR_CODES.nameDuplicate)
    }

    throw error
  }

  return prize
}

export async function updatePrize(id: string, value: string): Promise<Prize> {
  const { name, normalizedName } = normalizePrizeName(value)
  requirePrizeName(name)

  const database = await getDatabase()
  const transaction = database.transaction(STORE_NAMES.prizes, "readwrite")
  const prizeStore = transaction.objectStore(STORE_NAMES.prizes)
  const currentPrize = await prizeStore.get(id)

  if (!currentPrize) {
    await transaction.done
    throw new PrizeDomainError(PRIZE_ERROR_CODES.notFound)
  }

  const prizeWithName = await prizeStore.index(INDEX_NAMES.prizeNormalizedName).get(normalizedName)

  if (prizeWithName && prizeWithName.id !== id) {
    await transaction.done
    throw new PrizeDomainError(PRIZE_ERROR_CODES.nameDuplicate)
  }

  const updatedPrize: Prize = {
    ...currentPrize,
    name,
    normalizedName,
    updatedAt: new Date().toISOString(),
  }

  try {
    await prizeStore.put(updatedPrize)
    await transaction.done
  } catch (error) {
    if (isConstraintError(error)) {
      throw new PrizeDomainError(PRIZE_ERROR_CODES.nameDuplicate)
    }

    throw error
  }

  return updatedPrize
}

export async function deletePrize(id: string): Promise<void> {
  const database = await getDatabase()
  const transaction = database.transaction(STORE_NAMES.prizes, "readwrite")
  const prizeStore = transaction.objectStore(STORE_NAMES.prizes)

  if (!(await prizeStore.get(id))) {
    await transaction.done
    throw new PrizeDomainError(PRIZE_ERROR_CODES.notFound)
  }

  await prizeStore.delete(id)
  await transaction.done
}
