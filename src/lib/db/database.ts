import { openDB, type IDBPDatabase } from "idb"

import { DATABASE_NAME, DATABASE_VERSION, INDEX_NAMES, STORE_NAMES } from "@/lib/db/constants"
import type { LaBombitaDatabase } from "@/lib/db/schema"

let databasePromise: Promise<IDBPDatabase<LaBombitaDatabase>> | undefined

function upgradeDatabase(database: IDBPDatabase<LaBombitaDatabase>, oldVersion: number) {
  if (oldVersion < 1) {
    const prizeStore = database.createObjectStore(STORE_NAMES.prizes, { keyPath: "id" })
    prizeStore.createIndex(INDEX_NAMES.prizeNormalizedName, "normalizedName", { unique: true })

    database.createObjectStore(STORE_NAMES.appState, { keyPath: "key" })
  }
}

export function getDatabase(): Promise<IDBPDatabase<LaBombitaDatabase>> {
  if (!databasePromise) {
    databasePromise = openDB<LaBombitaDatabase>(DATABASE_NAME, DATABASE_VERSION, {
      upgrade: upgradeDatabase,
      terminated() {
        databasePromise = undefined
      },
    })

    databasePromise.catch(() => {
      databasePromise = undefined
    })
  }

  return databasePromise
}

export async function closeDatabaseConnection(): Promise<void> {
  if (!databasePromise) {
    return
  }

  const database = await databasePromise
  database.close()
  databasePromise = undefined
}
