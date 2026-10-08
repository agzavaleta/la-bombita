import { useCallback, useEffect, useRef } from "react"

import { FlatPrizeScene } from "@/components/scratch/FlatPrizeScene"
import {
  eraseScratchPath,
  getRevealedRatio,
  getScratchPoint,
  paintScratchSurface,
  type ScratchPoint,
} from "@/components/scratch/scratch-canvas"

const REVEAL_THRESHOLD = 0.6
const PROGRESS_CHECK_INTERVAL = 100

type ScratchSession = {
  hasEnded: boolean
  isReady: boolean
  pointerId: number
  queuedPoints: ScratchPoint[]
}

type ScratchCardProps = {
  prizeName?: string
  onScratchStart: () => Promise<boolean>
  onReveal: () => Promise<boolean>
}

function waitForNextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()))
}

export function ScratchCard({ onReveal, onScratchStart, prizeName }: ScratchCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const scratchSession = useRef<ScratchSession | undefined>(undefined)
  const lastPoint = useRef<ScratchPoint | undefined>(undefined)
  const lastProgressCheck = useRef(0)
  const isRevealPending = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current

    if (!canvas) {
      return
    }

    const paintSurface = () => paintScratchSurface(canvas)
    paintSurface()
    const resizeObserver = new ResizeObserver(paintSurface)
    resizeObserver.observe(canvas)

    return () => resizeObserver.disconnect()
  }, [])

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

  const readRevealedRatio = useCallback((): number => {
    const canvas = canvasRef.current

    if (!canvas) {
      return 0
    }

    return getRevealedRatio(canvas)
  }, [])

  const checkRevealProgress = useCallback(async () => {
    if (isRevealPending.current || readRevealedRatio() < REVEAL_THRESHOLD) {
      return
    }

    isRevealPending.current = true

    try {
      const revealed = await onReveal()
      if (!revealed) {
        isRevealPending.current = false
      }
    } catch {
      isRevealPending.current = false
    }
  }, [onReveal, readRevealedRatio])

  async function handlePointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
    event.preventDefault()
    const point = getPoint(event)

    if (!point) {
      return
    }

    if (scratchSession.current) {
      scratchSession.current = undefined
      lastPoint.current = undefined
      void checkRevealProgress()
    }

    event.currentTarget.setPointerCapture(event.pointerId)
    const session: ScratchSession = {
      hasEnded: false,
      isReady: false,
      pointerId: event.pointerId,
      queuedPoints: [point],
    }
    scratchSession.current = session
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

    if (!session.isReady) {
      return
    }

    scratchSession.current = undefined
    lastPoint.current = undefined
    void checkRevealProgress()
  }

  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-surface">
      <FlatPrizeScene prizeName={prizeName} />
      <canvas
        ref={canvasRef}
        aria-label="Superficie para raspar el premio del día"
        className="absolute inset-0 size-full touch-none cursor-crosshair"
        onPointerCancel={finishPointer}
        onPointerDown={(event) => {
          void handlePointerDown(event)
        }}
        onPointerMove={handlePointerMove}
        onPointerUp={finishPointer}
      />
    </div>
  )
}
