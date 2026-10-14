import { useCallback, useEffect, useState } from "react"

import { getSoundEnabled, saveSoundEnabled } from "@/lib/settings/sound-preference-repository"

export function useSoundPreference() {
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isActive = true

    getSoundEnabled()
      .then((storedSoundEnabled) => {
        if (isActive) {
          setSoundEnabled(storedSoundEnabled)
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (isActive) {
          setIsLoading(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [])

  const updateSoundEnabled = useCallback(async (nextSoundEnabled: boolean): Promise<void> => {
    await saveSoundEnabled(nextSoundEnabled)
    setSoundEnabled(nextSoundEnabled)
  }, [])

  return {
    isLoading,
    soundEnabled,
    updateSoundEnabled,
  }
}
