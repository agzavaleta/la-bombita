import { useCallback, useEffect, useRef, useState } from "react"

import bombLit from "@/assets/bomb/bomb-lit.png"
import bombUnlit from "@/assets/bomb/bomb-unlit.png"
import explosionBurst from "@/assets/bomb/explosion-burst.png"
import { ExplosionOverlay, type ExplosionOrigin } from "@/components/scratch/ExplosionOverlay"
import {
  eraseScratchPath,
  getRevealedRatio,
  getScratchPoint,
  paintSparkCanvas,
  type ScratchPoint,
} from "@/components/scratch/scratch-canvas"
import {
  playExplosionSound,
  playPrizeRevealSound,
  startScratchSound,
  stopScratchSound,
  unlockAudio,
} from "@/lib/audio/sound-effects"

const REVEAL_THRESHOLD = 0.85
const GESTURE_START_DISTANCE = 6
const PROGRESS_CHECK_INTERVAL = 80
const EXPLOSION_DURATION = 1350
const REDUCED_MOTION_EXPLOSION_DURATION = 390
const EXPLOSION_SOUND_DELAY = 180
const REDUCED_MOTION_EXPLOSION_SOUND_DELAY = 10

type RevealPhase = "ready" | "exploding"

type ScratchSession = {
  hasEnded: boolean
  hasStarted: boolean
  initialPoint: ScratchPoint
  isReady: boolean
  pointerId: number
  queuedPoints: ScratchPoint[]
}

type ScratchCardProps = {
  onScratchStart: () => Promise<boolean>
  onReveal: () => Promise<boolean>
  onSequenceComplete: () => void
  soundEnabled: boolean
}

function waitForNextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()))
}

function getDistance(firstPoint: ScratchPoint, secondPoint: ScratchPoint): number {
  return Math.hypot(secondPoint.x - firstPoint.x, secondPoint.y - firstPoint.y)
}

function getExplosionDuration(): number {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? REDUCED_MOTION_EXPLOSION_DURATION
    : EXPLOSION_DURATION
}

function getExplosionSoundDelay(): number {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? REDUCED_MOTION_EXPLOSION_SOUND_DELAY
    : EXPLOSION_SOUND_DELAY
}

export function ScratchCard({ onReveal, onScratchStart, onSequenceComplete, soundEnabled }: ScratchCardProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const scratchSession = useRef<ScratchSession | undefined>(undefined)
  const lastPoint = useRef<ScratchPoint | undefined>(undefined)
  const lastProgressCheck = useRef(0)
  const isRevealPending = useRef(false)
  const explosionTimeout = useRef<number | undefined>(undefined)
  const explosionSoundTimeout = useRef<number | undefined>(undefined)
  const [explosionOrigin, setExplosionOrigin] = useState<ExplosionOrigin>()
  const [phase, setPhase] = useState<RevealPhase>("ready")

  useEffect(() => {
    const canvas = canvasRef.current

    if (!canvas) {
      return
    }

    let isActive = true
    const litBombImage = new Image()
    const explosionImage = new Image()
    const paintBomb = () => {
      if (isActive) {
        paintSparkCanvas(canvas, litBombImage)
      }
    }

    litBombImage.addEventListener("load", paintBomb)
    litBombImage.src = bombLit
    explosionImage.src = explosionBurst

    if (litBombImage.complete) {
      paintBomb()
    }

    const resizeObserver = new ResizeObserver(paintBomb)
    resizeObserver.observe(canvas)

    return () => {
      isActive = false
      litBombImage.removeEventListener("load", paintBomb)
      resizeObserver.disconnect()
    }
  }, [])

  useEffect(
    () => () => {
      stopScratchSound()

      if (explosionTimeout.current !== undefined) {
        window.clearTimeout(explosionTimeout.current)
      }

      if (explosionSoundTimeout.current !== undefined) {
        window.clearTimeout(explosionSoundTimeout.current)
      }
    },
    [],
  )

  const getPoint = useCallback((event: React.PointerEvent<HTMLDivElement>): ScratchPoint | null => {
    const canvas = canvasRef.current

    if (!canvas) {
      return null
    }

    return getScratchPoint(canvas, event.clientX, event.clientY)
  }, [])

  const eraseTo = useCallback((point: ScratchPoint) => {
    const canvas = canvasRef.current

    if (!canvas) {
      return
    }

    const previousPoint = lastPoint.current ?? point
    eraseScratchPath(canvas, point, previousPoint)
    lastPoint.current = point
  }, [])

  const checkRevealProgress = useCallback(async () => {
    const canvas = canvasRef.current

    if (isRevealPending.current || !canvas) {
      return
    }

    if (getRevealedRatio(canvas) < REVEAL_THRESHOLD) {
      return
    }

    stopScratchSound()
    isRevealPending.current = true

    try {
      const revealed = await onReveal()

      if (!revealed) {
        isRevealPending.current = false
        return
      }

      const bounds = containerRef.current?.getBoundingClientRect()

      if (bounds) {
        setExplosionOrigin({
          x: bounds.left + bounds.width / 2,
          y: bounds.top + bounds.height / 2,
        })
      }

      setPhase("exploding")

      if (soundEnabled) {
        explosionSoundTimeout.current = window.setTimeout(playExplosionSound, getExplosionSoundDelay())
      }

      explosionTimeout.current = window.setTimeout(() => {
        if (soundEnabled) {
          playPrizeRevealSound()
        }

        onSequenceComplete()
      }, getExplosionDuration())
    } catch {
      isRevealPending.current = false
    }
  }, [onReveal, onSequenceComplete, soundEnabled])

  const prepareScratch = useCallback(
    async (session: ScratchSession) => {
      const canScratch = await onScratchStart()

      if (scratchSession.current !== session) {
        return
      }

      if (!canScratch) {
        stopScratchSound()
        scratchSession.current = undefined
        return
      }

      await waitForNextFrame()

      if (scratchSession.current !== session) {
        return
      }

      session.isReady = true
      session.queuedPoints.forEach(eraseTo)
      session.queuedPoints = []

      if (session.hasEnded) {
        scratchSession.current = undefined
        lastPoint.current = undefined
        void checkRevealProgress()
      }
    },
    [checkRevealProgress, eraseTo, onScratchStart],
  )

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    event.preventDefault()
    const point = getPoint(event)

    if (!point || phase !== "ready") {
      return
    }

    if (soundEnabled) {
      unlockAudio()
    }

    event.currentTarget.setPointerCapture(event.pointerId)
    scratchSession.current = {
      hasEnded: false,
      hasStarted: false,
      initialPoint: point,
      isReady: false,
      pointerId: event.pointerId,
      queuedPoints: [point],
    }
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const session = scratchSession.current

    if (!session || session.pointerId !== event.pointerId) {
      return
    }

    event.preventDefault()
    const point = getPoint(event)

    if (!point) {
      return
    }

    if (session.isReady) {
      eraseTo(point)
    } else {
      session.queuedPoints.push(point)

      if (!session.hasStarted && getDistance(session.initialPoint, point) >= GESTURE_START_DISTANCE) {
        session.hasStarted = true

        if (soundEnabled) {
          startScratchSound()
        }

        void prepareScratch(session)
      }
    }

    if (session.isReady && event.timeStamp - lastProgressCheck.current >= PROGRESS_CHECK_INTERVAL) {
      lastProgressCheck.current = event.timeStamp
      void checkRevealProgress()
    }
  }

  function finishPointer(event: React.PointerEvent<HTMLDivElement>) {
    const session = scratchSession.current

    if (!session || session.pointerId !== event.pointerId) {
      return
    }

    session.hasEnded = true
    stopScratchSound()

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    if (!session.hasStarted) {
      scratchSession.current = undefined
      lastPoint.current = undefined
      return
    }

    if (!session.isReady) {
      return
    }

    scratchSession.current = undefined
    lastPoint.current = undefined
    void checkRevealProgress()
  }

  return (
    <div
      ref={containerRef}
      className="relative aspect-square overflow-visible rounded-2xl"
      aria-label="Bomba del premio del día"
    >
      <span aria-hidden="true" className="soft-glow soft-glow--brand" />
      <img
        alt={phase === "exploding" ? "Bomba a punto de revelar el premio" : "Bomba encendida"}
        className={`absolute inset-0 size-full object-contain p-3 ${phase === "exploding" ? "animate-bomb-exit" : ""}`}
        src={bombUnlit}
      />

      {phase === "ready" ? (
        <>
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            className="pointer-events-none absolute -right-[7%] -top-[7%] h-[107%] w-[107%]"
          />
          <div
            aria-label="Chispa raspable de la mecha"
            className="absolute -right-[7%] -top-[7%] h-[48%] w-[45%] touch-none cursor-crosshair"
            onPointerCancel={finishPointer}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={finishPointer}
            role="img"
          />
        </>
      ) : null}

      {phase === "exploding" && explosionOrigin ? <ExplosionOverlay origin={explosionOrigin} /> : null}
    </div>
  )
}
