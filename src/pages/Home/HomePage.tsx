import { useEffect } from "react"
import { toast } from "sonner"

import { LoadErrorState } from "@/components/LoadErrorState"
import { FlatPrizeScene } from "@/components/scratch/FlatPrizeScene"
import { HomeEmptyState } from "@/components/scratch/HomeEmptyState"
import { ScratchCard } from "@/components/scratch/ScratchCard"
import { Card, CardContent } from "@/components/ui/card"
import { useDailyPrize } from "@/hooks/use-daily-prize"

type HomePageProps = {
  onAddFirstPrize: () => void
}

export function HomePage({ onAddFirstPrize }: HomePageProps) {
  const { beginScratch, dailyPrize, isLoading, loadError, prizes, revealPrize } = useDailyPrize()

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
    try {
      return await revealPrize()
    } catch {
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

      {dailyPrize?.revealed ? (
        <Card>
          <CardContent className="space-y-5 p-4">
            <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-border">
              <FlatPrizeScene prizeName={dailyPrize.prizeNameSnapshot} />
            </div>
            <p className="text-center text-sm font-bold text-slate-500">Nuevo premio disponible mañana</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="space-y-4 p-4">
            <ScratchCard
              prizeName={dailyPrize?.prizeNameSnapshot}
              onScratchStart={startScratch}
              onReveal={completeReveal}
            />
            <p className="text-center text-sm text-slate-500">Desliza el dedo sobre la superficie para descubrirlo.</p>
          </CardContent>
        </Card>
      )}
    </section>
  )
}
