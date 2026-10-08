import { RefreshCw } from "lucide-react"
import { useState, useSyncExternalStore } from "react"

import { Button } from "@/components/ui/button"
import {
  getPwaUpdateSnapshot,
  subscribeToPwaUpdate,
  updateServiceWorker,
} from "@/lib/pwa/pwa-update"

export function PwaUpdatePrompt() {
  const isUpdateAvailable = useSyncExternalStore(
    subscribeToPwaUpdate,
    getPwaUpdateSnapshot,
    getPwaUpdateSnapshot,
  )
  const [isUpdating, setIsUpdating] = useState(false)

  if (!isUpdateAvailable) {
    return null
  }

  async function applyUpdate() {
    setIsUpdating(true)

    try {
      await updateServiceWorker()
    } catch {
      setIsUpdating(false)
    }
  }

  return (
    <aside
      aria-live="polite"
      className="fixed inset-x-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-40 mx-auto max-w-[calc(28rem-2rem)] rounded-2xl border border-border bg-surface p-4"
      role="status"
    >
      <p className="text-sm font-semibold text-text-primary">Hay una nueva versión de La Bombita disponible.</p>
      <Button className="mt-3 h-11 w-full" disabled={isUpdating} onClick={() => void applyUpdate()} type="button">
        <RefreshCw aria-hidden="true" className={isUpdating ? "animate-spin" : undefined} />
        Actualizar ahora
      </Button>
    </aside>
  )
}
