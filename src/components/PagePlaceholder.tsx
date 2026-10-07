import type { PropsWithChildren } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type PagePlaceholderProps = PropsWithChildren<{
  title: string
}>

export function PagePlaceholder({ children, title }: PagePlaceholderProps) {
  return (
    <section aria-labelledby="page-title" className="space-y-6">
      <h1 id="page-title" className="text-3xl font-extrabold tracking-tight">
        {title}
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>La Bombita</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">{children}</p>
        </CardContent>
      </Card>
    </section>
  )
}
