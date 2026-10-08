import { TulinPlaceholder } from "@/components/scratch/TulinPlaceholder"

type FlatPrizeSceneProps = {
  prizeName?: string
}

export function FlatPrizeScene({ prizeName }: FlatPrizeSceneProps) {
  return (
    <div className="relative flex h-full items-center overflow-hidden rounded-2xl bg-brand-subtle px-4 py-5">
      <TulinPlaceholder className="z-10 w-[38%] shrink-0" />
      <div className="relative ml-[-0.5rem] flex flex-1 items-center justify-center self-stretch">
        <div className="absolute left-1/2 top-3 h-12 w-2 -translate-x-1/2 rotate-[28deg] rounded-full bg-slate-900" />
        <div className="absolute left-[56%] top-1 size-4 rounded-full bg-prize" />
        <div className="relative flex aspect-square w-full max-w-52 items-center justify-center rounded-full bg-slate-900 p-6 text-center">
          <p className="line-clamp-3 break-words text-lg font-extrabold leading-tight text-white">
            {prizeName ?? "Tu premio"}
          </p>
        </div>
      </div>
      <span className="absolute bottom-2 right-3 text-[10px] font-bold uppercase tracking-wide text-slate-500">
        Ilustración provisional
      </span>
    </div>
  )
}
