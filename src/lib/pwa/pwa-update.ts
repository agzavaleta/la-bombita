import { registerSW } from "virtual:pwa-register"

type UpdateListener = () => void

let isUpdateAvailable = false
const listeners = new Set<UpdateListener>()

function notifyUpdateAvailable() {
  isUpdateAvailable = true
  listeners.forEach((listener) => listener())
}

export const updateServiceWorker = registerSW({
  immediate: true,
  onNeedRefresh: notifyUpdateAvailable,
})

export function subscribeToPwaUpdate(listener: UpdateListener) {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

export function getPwaUpdateSnapshot() {
  return isUpdateAvailable
}
