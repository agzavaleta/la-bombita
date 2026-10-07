import { useCallback, useEffect, useRef, useState } from "react"

import {
  clearCurrentDailyPrize,
  getCurrentDailyPrize,
  saveCurrentDailyPrize,
} from "@/lib/daily-prize/daily-prize-repository"
import { getLocalDateKey } from "@/lib/daily-prize/date-key"
import { getPrizes } from "@/lib/prizes/prize-repository"
import type { DailyPrize } from "@/types/daily-prize"
import type { Prize } from "@/types/prize"

type DailyPrizeState = {
  dailyPrize: DailyPrize | null
  isLoading: boolean
  loadError: unknown
  prizes: Prize[]
}

export function useDailyPrize() {
  const [state, setState] = useState<DailyPrizeState>({
    dailyPrize: null,
    isLoading: true,
    loadError: undefined,
    prizes: [],
  })
  const selectionPromise = useRef<Promise<DailyPrize | null> | undefined>(undefined)

  useEffect(() => {
    let isActive = true

    Promise.all([getPrizes(), getCurrentDailyPrize()])
      .then(async ([storedPrizes, storedDailyPrize]) => {
        const currentDateKey = getLocalDateKey()
        const isOutdated = storedDailyPrize !== null && storedDailyPrize.dateKey !== currentDateKey

        if (isOutdated) {
          await clearCurrentDailyPrize()
        }

        if (isActive) {
          setState({
            dailyPrize: isOutdated ? null : storedDailyPrize,
            isLoading: false,
            loadError: undefined,
            prizes: storedPrizes,
          })
        }
      })
      .catch((error: unknown) => {
        if (isActive) {
          setState((currentState) => ({ ...currentState, isLoading: false, loadError: error }))
        }
      })

    return () => {
      isActive = false
    }
  }, [])

  useEffect(() => {
    if (!state.dailyPrize) {
      return
    }

    const now = new Date()
    const nextDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
    const millisecondsUntilNextDay = nextDay.getTime() - now.getTime() + 100

    const timeoutId = window.setTimeout(() => {
      clearCurrentDailyPrize()
        .then(() => {
          setState((currentState) => ({ ...currentState, dailyPrize: null }))
        })
        .catch((error: unknown) => {
          setState((currentState) => ({ ...currentState, loadError: error }))
        })
    }, millisecondsUntilNextDay)

    return () => window.clearTimeout(timeoutId)
  }, [state.dailyPrize])

  const beginScratch = useCallback(async (): Promise<DailyPrize | null> => {
    const currentDateKey = getLocalDateKey()

    if (state.dailyPrize?.dateKey === currentDateKey) {
      return state.dailyPrize
    }

    if (selectionPromise.current !== undefined) {
      return selectionPromise.current
    }

    const pendingSelection = (async () => {
      if (state.dailyPrize) {
        await clearCurrentDailyPrize()
      }

      if (state.prizes.length === 0) {
        return null
      }

      const selectedPrize = state.prizes[Math.floor(Math.random() * state.prizes.length)]

      if (!selectedPrize) {
        return null
      }

      const dailyPrize: DailyPrize = {
        dateKey: currentDateKey,
        prizeId: selectedPrize.id,
        prizeNameSnapshot: selectedPrize.name,
        revealed: false,
        revealedAt: "",
      }

      await saveCurrentDailyPrize(dailyPrize)
      setState((currentState) => ({ ...currentState, dailyPrize }))
      return dailyPrize
    })()

    selectionPromise.current = pendingSelection

    try {
      return await pendingSelection
    } finally {
      selectionPromise.current = undefined
    }
  }, [state.dailyPrize, state.prizes])

  const revealPrize = useCallback(async (): Promise<boolean> => {
    if (!state.dailyPrize || state.dailyPrize.dateKey !== getLocalDateKey()) {
      return false
    }

    const revealedDailyPrize: DailyPrize = {
      ...state.dailyPrize,
      revealed: true,
      revealedAt: new Date().toISOString(),
    }

    await saveCurrentDailyPrize(revealedDailyPrize)
    setState((currentState) => ({ ...currentState, dailyPrize: revealedDailyPrize }))
    return true
  }, [state.dailyPrize])

  return {
    beginScratch,
    dailyPrize: state.dailyPrize,
    isLoading: state.isLoading,
    loadError: state.loadError,
    prizes: state.prizes,
    revealPrize,
  }
}
