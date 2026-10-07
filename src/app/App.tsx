import { useState } from "react"
import { registerSW } from "virtual:pwa-register"

import { BottomNavigation } from "@/components/navigation/BottomNavigation"
import { Toaster } from "@/components/ui/sonner"
import { HomePage } from "@/pages/Home/HomePage"
import { PrizesPage } from "@/pages/Prizes/PrizesPage"
import { SettingsPage } from "@/pages/Settings/SettingsPage"
import type { MainSection } from "@/types/navigation"

registerSW({ immediate: true })

const pages: Record<MainSection, React.ComponentType> = {
  home: HomePage,
  prizes: PrizesPage,
  settings: SettingsPage,
}

export function App() {
  const [activeSection, setActiveSection] = useState<MainSection>("home")
  const ActivePage = pages[activeSection]

  return (
    <div className="mx-auto min-h-dvh w-full max-w-md bg-red-50 text-slate-900">
      <main className="px-5 pb-28 pt-[max(2rem,env(safe-area-inset-top))]">
        <ActivePage />
      </main>
      <BottomNavigation activeSection={activeSection} onSectionChange={setActiveSection} />
      <Toaster />
    </div>
  )
}
