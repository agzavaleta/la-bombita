import { useEffect, useState } from "react"
import { toast } from "sonner"

import { HomeEmptyState } from "@/components/scratch/HomeEmptyState"
import { PrizeRevealScene } from "@/components/scratch/PrizeRevealScene"
import { ScratchCard } from "@/components/scratch/ScratchCard"
import { useDailyPrize } from "@/hooks/use-daily-prize"

type HomePageProps = {
  onAddFirstPrize: () => void
}

const centeredHomeSectionClassName =
  "flex min-h-[calc(100dvh-max(2rem,env(safe-area-inset-top))-7rem-env(safe-area-inset-bottom))] flex-col items-center justify-center gap-6 text-center"

export function HomePage({ onAddFirstPrize }: HomePageProps) {
  const { beginScratch, dailyPrize, isLoading, loadError, prizes, revealPrize } = useDailyPrize()
  const [isRevealSequenceActive, setIsRevealSequenceActive] = useState(false)

  useEffect(() => {
    if (loadError) {
      toast.error("No se pudo recuperar el premio del día. Inténtalo nuevamente.")
    }
  }, [loadError])

  async function startScratch(): Promise<boolean> {
    try {
      return (await beginScratch()) !== null
    } catch {
      toast.error("No se pudo guardar el premio del día. Inténtalo nuevamente.")
      return false
    }
  }

  async function completeReveal(): Promise<boolean> {
    setIsRevealSequenceActive(true)

    try {
      const revealed = await revealPrize()

      if (!revealed) {
        setIsRevealSequenceActive(false)
      }

      return revealed
    } catch {
      setIsRevealSequenceActive(false)
      toast.error("No se pudo guardar el premio revelado. Inténtalo nuevamente.")
      return false
    }
  }

  if (isLoading) {
    return (
      <section aria-labelledby="home-title" className={centeredHomeSectionClassName}>
        <h1 id="home-title" className="text-3xl font-extrabold tracking-tight">
          Inicio
        </h1>
        <p aria-live="polite" className="text-sm text-text-secondary">
          Cargando…
        </p>
      </section>
    )
  }

  if (loadError) {
    return (
      <section aria-labelledby="home-title" className={centeredHomeSectionClassName}>
        <h1 id="home-title" className="text-3xl font-extrabold tracking-tight">
          Inicio
        </h1>
        <div role="alert" className="space-y-2">
          <p className="font-bold text-text-primary">No se pudo cargar el premio del día.</p>
          <p className="text-sm text-text-secondary">Recarga la aplicación para intentarlo nuevamente.</p>
        </div>
      </section>
    )
  }

  if (!dailyPrize && prizes.length === 0) {
    return (
      <section aria-label="Inicio" className={centeredHomeSectionClassName}>
        <HomeEmptyState onAddFirstPrize={onAddFirstPrize} />
      </section>
    )
  }

  return (
    <section aria-labelledby="home-title" className={centeredHomeSectionClassName}>
      <h1 id="home-title" className="text-3xl font-extrabold tracking-tight">
        Premio del día
      </h1>

      {dailyPrize?.revealed && !isRevealSequenceActive ? (
        <div className="w-full max-w-80 space-y-5">
          <div className="animate-tulin-reveal">
            <PrizeRevealScene prizeName={dailyPrize.prizeNameSnapshot} />
          </div>
          <p className="text-sm font-bold text-text-secondary">Nuevo premio disponible mañana</p>
        </div>
      ) : (
        <div className="w-full max-w-80 space-y-4">
          <ScratchCard
            onScratchStart={startScratch}
            onReveal={completeReveal}
            onSequenceComplete={() => setIsRevealSequenceActive(false)}
          />
          <p className="text-sm text-text-secondary">Raspa la chispa para descubrir tu premio.</p>
        </div>
      )}
    </section>
  )
}
