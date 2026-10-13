import { registerSW } from "virtual:pwa-register"

type UpdateListener = () => void

const UPDATE_CHECK_THROTTLE_MS = 60_000

let isUpdateAvailable = false
let lastUpdateCheckAt = 0
let registeredServiceWorker: ServiceWorkerRegistration | undefined
let updateCheckPromise: Promise<void> | undefined
let isVisibilityListenerRegistered = false
const listeners = new Set<UpdateListener>()

function notifyUpdateAvailable() {
  isUpdateAvailable = true
  listeners.forEach((listener) => listener())
}

function checkForPwaUpdate(): Promise<void> | undefined {
  if (!registeredServiceWorker || updateCheckPromise) {
    return updateCheckPromise
  }

  const now = Date.now()

  if (now - lastUpdateCheckAt < UPDATE_CHECK_THROTTLE_MS) {
    return undefined
  }

  lastUpdateCheckAt = now
  const registration = registeredServiceWorker
  updateCheckPromise = Promise.resolve()
    .then(() => registration.update())
    .then(() => undefined)
    .catch(() => undefined)
    .finally(() => {
      updateCheckPromise = undefined
    })

  return updateCheckPromise
}

function handleVisibilityChange() {
  if (document.visibilityState === "visible") {
    void checkForPwaUpdate()
  }
}

function registerProactiveUpdateChecks(registration: ServiceWorkerRegistration | undefined) {
  if (!registration) {
    return
  }

  registeredServiceWorker = registration
  void checkForPwaUpdate()

  if (!isVisibilityListenerRegistered) {
    document.addEventListener("visibilitychange", handleVisibilityChange)
    isVisibilityListenerRegistered = true
  }
}

export const updateServiceWorker = registerSW({
  immediate: true,
  onNeedRefresh: notifyUpdateAvailable,
  onRegisteredSW: (_serviceWorkerUrl, registration) => registerProactiveUpdateChecks(registration),
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
