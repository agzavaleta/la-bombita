import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

type TulinStoryPageProps = {
  onBack: () => void
}

export function TulinStoryPage({ onBack }: TulinStoryPageProps) {
  return (
    <section aria-labelledby="tulin-story-title" className="space-y-6">
      <Button type="button" variant="ghost" className="-ml-3 h-11" onClick={onBack}>
        <ArrowLeft aria-hidden="true" className="size-5" />
        Volver
      </Button>
      <h1 id="tulin-story-title" className="text-3xl font-extrabold tracking-tight">
        Historia de Tulín Bombín
      </h1>
      <Card>
        <CardContent className="p-6 text-sm text-slate-500">Contenido pendiente.</CardContent>
      </Card>
    </section>
  )
}
