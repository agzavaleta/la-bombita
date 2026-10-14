import tulinPrizeReveal from "@/assets/tulin/tulin-prize-reveal.png"

type PrizeRevealSceneProps = {
  prizeName: string
}

export function PrizeRevealScene({ prizeName }: PrizeRevealSceneProps) {
  return (
    <div className="relative flex min-h-80 flex-col items-center justify-end px-4 pb-5 pt-3">
      <span aria-hidden="true" className="home-soft-glow home-soft-glow--reveal" />
      <img
        alt="Tulín mostrando el premio del día"
        className="relative min-h-0 w-full max-w-80 flex-1 object-contain"
        src={tulinPrizeReveal}
      />
      <div className="relative -mt-8 w-full max-w-72 rounded-2xl border border-warning bg-surface px-5 py-4 text-center">
        <p className="break-words text-xl font-extrabold leading-tight text-text-primary">{prizeName}</p>
      </div>
    </div>
  )
}
