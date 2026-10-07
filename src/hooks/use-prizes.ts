import { useCallback, useEffect, useState } from "react"

import { createPrize, deletePrize, getPrizes, updatePrize } from "@/lib/prizes/prize-repository"
import type { Prize } from "@/types/prize"

export function usePrizes() {
  const [prizes, setPrizes] = useState<Prize[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<unknown>()

  useEffect(() => {
    let isActive = true

    getPrizes()
      .then((storedPrizes) => {
        if (isActive) {
          setPrizes(storedPrizes)
        }
      })
      .catch((error: unknown) => {
        if (isActive) {
          setLoadError(error)
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [])

  const addPrize = useCallback(async (name: string) => {
    const createdPrize = await createPrize(name)
    setPrizes((currentPrizes) => [...currentPrizes, createdPrize])
    return createdPrize
  }, [])

  const editPrize = useCallback(async (id: string, name: string) => {
    const updatedPrize = await updatePrize(id, name)
    setPrizes((currentPrizes) => currentPrizes.map((prize) => (prize.id === id ? updatedPrize : prize)))
    return updatedPrize
  }, [])

  const removePrize = useCallback(async (id: string) => {
    await deletePrize(id)
    setPrizes((currentPrizes) => currentPrizes.filter((prize) => prize.id !== id))
  }, [])

  return {
    addPrize,
    editPrize,
    isLoading,
    loadError,
    prizes,
    removePrize,
  }
}
