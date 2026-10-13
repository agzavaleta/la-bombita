import { Card, CardContent } from "@/components/ui/card"

type LoadErrorStateProps = {
  message: string
}

export function LoadErrorState({ message }: LoadErrorStateProps) {
  return (
    <Card role="alert">
      <CardContent className="space-y-2 p-6 text-center">
        <p className="font-bold text-text-primary">{message}</p>
        <p className="text-sm text-text-secondary">Recarga la aplicación para intentarlo nuevamente.</p>
      </CardContent>
    </Card>
  )
}
