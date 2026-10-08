import { useState } from "react"

import { BottomNavigation } from "@/components/navigation/BottomNavigation"
import { PwaUpdatePrompt } from "@/components/pwa/PwaUpdatePrompt"
import { Toaster } from "@/components/ui/sonner"
import { HomePage } from "@/pages/Home/HomePage"
import { PrizesPage } from "@/pages/Prizes/PrizesPage"
import { SettingsPage } from "@/pages/Settings/SettingsPage"
import { TulinStoryPage } from "@/pages/TulinStory/TulinStoryPage"
import type { MainSection } from "@/types/navigation"

export function App() {
  const [activeSection, setActiveSection] = useState<MainSection>("home")
  const [openPrizeCreation, setOpenPrizeCreation] = useState(false)
  const [isTulinStoryOpen, setIsTulinStoryOpen] = useState(false)

  function changeSection(section: MainSection) {
    setOpenPrizeCreation(false)
    setActiveSection(section)
  }

  function addFirstPrize() {
    setOpenPrizeCreation(true)
    setActiveSection("prizes")
  }

  if (isTulinStoryOpen) {
    return (
      <div className="mx-auto min-h-dvh w-full max-w-md bg-app-background text-text-primary">
        <main className="px-5 pb-10 pt-[max(2rem,env(safe-area-inset-top))]">
          <TulinStoryPage onBack={() => setIsTulinStoryOpen(false)} />
        </main>
        <PwaUpdatePrompt />
        <Toaster />
      </div>
    )
  }

  return (
    <div className="mx-auto min-h-dvh w-full max-w-md bg-app-background text-text-primary">
      <main className="px-5 pb-28 pt-[max(2rem,env(safe-area-inset-top))]">
        {activeSection === "home" ? <HomePage onAddFirstPrize={addFirstPrize} /> : null}
        {activeSection === "prizes" ? <PrizesPage openCreateOnMount={openPrizeCreation} /> : null}
        {activeSection === "settings" ? <SettingsPage onOpenTulinStory={() => setIsTulinStoryOpen(true)} /> : null}
      </main>
      <PwaUpdatePrompt />
      <BottomNavigation activeSection={activeSection} onSectionChange={changeSection} />
      <Toaster />
    </div>
  )
}
