import { useCallback, useEffect, useRef, useState } from "react"

import bombLit from "@/assets/bomb/bomb-lit.png"
import bombUnlit from "@/assets/bomb/bomb-unlit.png"
import sparkSheet from "@/assets/bomb/spark-sheet.png"
import {
  eraseScratchPath,
  getRevealedRatio,
  getScratchPoint,
  paintSparkScratchSurface,
  type ScratchPoint,
} from "@/components/scratch/scratch-canvas"

const REVEAL_THRESHOLD = 0.85
const GESTURE_START_DISTANCE = 6
const PROGRESS_CHECK_INTERVAL = 80
const EXPLOSION_DURATION = 650

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
}

function waitForNextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()))
}

function getDistance(firstPoint: ScratchPoint, secondPoint: ScratchPoint): number {
  return Math.hypot(secondPoint.x - firstPoint.x, secondPoint.y - firstPoint.y)
}

export function ScratchCard({ onReveal, onScratchStart, onSequenceComplete }: ScratchCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const scratchSession = useRef<ScratchSession | undefined>(undefined)
  const lastPoint = useRef<ScratchPoint | undefined>(undefined)
  const lastProgressCheck = useRef(0)
  const isRevealPending = useRef(false)
  const explosionTimeout = useRef<number | undefined>(undefined)
  const [phase, setPhase] = useState<RevealPhase>("ready")

  useEffect(() => {
    const canvas = canvasRef.current

    if (!canvas) {
      return
    }

    const paintSurface = () => paintSparkScratchSurface(canvas)
    paintSurface()
    const resizeObserver = new ResizeObserver(paintSurface)
    resizeObserver.observe(canvas)

    return () => resizeObserver.disconnect()
  }, [])

  useEffect(
    () => () => {
      if (explosionTimeout.current !== undefined) {
        window.clearTimeout(explosionTimeout.current)
      }
    },
    [],
  )

  const getPoint = useCallback((event: React.PointerEvent<HTMLCanvasElement>): ScratchPoint | null => {
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

    if (isRevealPending.current || !canvas || getRevealedRatio(canvas) < REVEAL_THRESHOLD) {
      return
    }

    isRevealPending.current = true

    try {
      const revealed = await onReveal()

      if (!revealed) {
        isRevealPending.current = false
        return
      }

      setPhase("exploding")
      explosionTimeout.current = window.setTimeout(() => {
        onSequenceComplete()
      }, EXPLOSION_DURATION)
    } catch {
      isRevealPending.current = false
    }
  }, [onReveal, onSequenceComplete])

  const prepareScratch = useCallback(
    async (session: ScratchSession) => {
      const canScratch = await onScratchStart()

      if (scratchSession.current !== session) {
        return
      }

      if (!canScratch) {
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

  function handlePointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
    event.preventDefault()
    const point = getPoint(event)

    if (!point || phase !== "ready") {
      return
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

  function handlePointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
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
        void prepareScratch(session)
      }
    }

    if (session.isReady && event.timeStamp - lastProgressCheck.current >= PROGRESS_CHECK_INTERVAL) {
      lastProgressCheck.current = event.timeStamp
      void checkRevealProgress()
    }
  }

  function finishPointer(event: React.PointerEvent<HTMLCanvasElement>) {
    const session = scratchSession.current

    if (!session || session.pointerId !== event.pointerId) {
      return
    }

    session.hasEnded = true

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
    <div className="relative aspect-square overflow-hidden rounded-2xl bg-brand-subtle" aria-label="Bomba del premio del día">
      <img
        alt={phase === "exploding" ? "Bomba a punto de revelar el premio" : "Bomba encendida"}
        className={`absolute inset-0 size-full object-contain p-3 ${phase === "exploding" ? "animate-bomb-shake" : ""}`}
        src={phase === "exploding" ? bombUnlit : bombLit}
      />

      {phase === "ready" ? (
        <canvas
          ref={canvasRef}
          aria-label="Chispa raspable de la mecha"
          className="absolute left-[69%] top-[1%] size-[29%] touch-none cursor-crosshair"
          onPointerCancel={finishPointer}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishPointer}
        />
      ) : null}

      {phase === "exploding" ? (
        <div aria-hidden="true" className="absolute inset-0">
          <div className="animate-explosion-flash absolute left-1/2 top-1/2 size-44 -translate-x-1/2 -translate-y-1/2 rounded-full bg-prize-soft" />
          <div
            className="animate-spark-burst absolute left-1/2 top-1/2 size-52 -translate-x-1/2 -translate-y-1/2 bg-[length:500%_200%] bg-no-repeat"
            style={{ backgroundImage: `url(${sparkSheet})` }}
          />
        </div>
      ) : null}
    </div>
  )
}
