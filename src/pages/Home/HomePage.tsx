import { useEffect, useState } from "react"
import { toast } from "sonner"

import { LoadErrorState } from "@/components/LoadErrorState"
import { HomeEmptyState } from "@/components/scratch/HomeEmptyState"
import { PrizeRevealScene } from "@/components/scratch/PrizeRevealScene"
import { ScratchCard } from "@/components/scratch/ScratchCard"
import { Card, CardContent } from "@/components/ui/card"
import { useDailyPrize } from "@/hooks/use-daily-prize"

type HomePageProps = {
  onAddFirstPrize: () => void
}

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
      <section aria-labelledby="home-title" className="space-y-6">
        <h1 id="home-title" className="text-3xl font-extrabold tracking-tight">
          Inicio
        </h1>
        <Card aria-live="polite">
          <CardContent className="p-6 text-center text-sm text-slate-500">Cargando…</CardContent>
        </Card>
      </section>
    )
  }

  if (loadError) {
    return (
      <section aria-labelledby="home-title" className="space-y-6">
        <h1 id="home-title" className="text-3xl font-extrabold tracking-tight">
          Inicio
        </h1>
        <LoadErrorState message="No se pudo cargar el premio del día." />
      </section>
    )
  }

  if (!dailyPrize && prizes.length === 0) {
    return (
      <section aria-labelledby="home-title" className="space-y-6">
        <h1 id="home-title" className="text-3xl font-extrabold tracking-tight">
          Inicio
        </h1>
        <HomeEmptyState onAddFirstPrize={onAddFirstPrize} />
      </section>
    )
  }

  return (
    <section aria-labelledby="home-title" className="space-y-4">
      <h1 id="home-title" className="text-3xl font-extrabold tracking-tight">
        Premio del día
      </h1>

      {dailyPrize?.revealed && !isRevealSequenceActive ? (
        <Card>
          <CardContent className="space-y-5 p-4">
            <div className="animate-tulin-reveal">
              <PrizeRevealScene prizeName={dailyPrize.prizeNameSnapshot} />
            </div>
            <p className="text-center text-sm font-bold text-slate-500">Nuevo premio disponible mañana</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="space-y-4 p-4">
            <ScratchCard
              onScratchStart={startScratch}
              onReveal={completeReveal}
              onSequenceComplete={() => setIsRevealSequenceActive(false)}
            />
            <p className="text-center text-sm text-slate-500">Raspa la chispa para descubrir tu premio.</p>
          </CardContent>
        </Card>
      )}
    </section>
  )
}
