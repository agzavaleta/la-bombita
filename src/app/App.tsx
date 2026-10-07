import { useState } from "react"
import { registerSW } from "virtual:pwa-register"

import { BottomNavigation } from "@/components/navigation/BottomNavigation"
import { Toaster } from "@/components/ui/sonner"
import { HomePage } from "@/pages/Home/HomePage"
import { PrizesPage } from "@/pages/Prizes/PrizesPage"
import { SettingsPage } from "@/pages/Settings/SettingsPage"
import type { MainSection } from "@/types/navigation"

registerSW({ immediate: true })

export function App() {
  const [activeSection, setActiveSection] = useState<MainSection>("home")
  const [openPrizeCreation, setOpenPrizeCreation] = useState(false)

  function changeSection(section: MainSection) {
    setOpenPrizeCreation(false)
    setActiveSection(section)
  }

  function addFirstPrize() {
    setOpenPrizeCreation(true)
    setActiveSection("prizes")
  }

  return (
    <div className="mx-auto min-h-dvh w-full max-w-md bg-red-50 text-slate-900">
      <main className="px-5 pb-28 pt-[max(2rem,env(safe-area-inset-top))]">
        {activeSection === "home" ? <HomePage onAddFirstPrize={addFirstPrize} /> : null}
        {activeSection === "prizes" ? <PrizesPage openCreateOnMount={openPrizeCreation} /> : null}
        {activeSection === "settings" ? <SettingsPage /> : null}
      </main>
      <BottomNavigation activeSection={activeSection} onSectionChange={changeSection} />
      <Toaster />
    </div>
  )
}
