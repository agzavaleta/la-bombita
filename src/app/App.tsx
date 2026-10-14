import { useState } from "react"

import { BottomNavigation } from "@/components/navigation/BottomNavigation"
import { PwaUpdatePrompt } from "@/components/pwa/PwaUpdatePrompt"
import { Toaster } from "@/components/ui/sonner"
import { useSoundPreference } from "@/hooks/use-sound-preference"
import { HomePage } from "@/pages/Home/HomePage"
import { PrizesPage } from "@/pages/Prizes/PrizesPage"
import { SettingsPage } from "@/pages/Settings/SettingsPage"
import { TulinStoryPage } from "@/pages/TulinStory/TulinStoryPage"
import type { MainSection } from "@/types/navigation"

export function App() {
  const [activeSection, setActiveSection] = useState<MainSection>("home")
  const [openPrizeCreation, setOpenPrizeCreation] = useState(false)
  const [isTulinStoryOpen, setIsTulinStoryOpen] = useState(false)
  const { isLoading: isSoundPreferenceLoading, soundEnabled, updateSoundEnabled } = useSoundPreference()

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
      <div className="mx-auto min-h-dvh w-full max-w-md bg-background text-text-primary">
        <main className="px-5 pb-10 pt-[max(2rem,env(safe-area-inset-top))]">
          <TulinStoryPage onBack={() => setIsTulinStoryOpen(false)} />
        </main>
        <PwaUpdatePrompt />
        <Toaster />
      </div>
    )
  }

  return (
    <div className="mx-auto min-h-dvh w-full max-w-md bg-background text-text-primary">
      <main className="px-5 pb-28 pt-[max(2rem,env(safe-area-inset-top))]">
        {activeSection === "home" ? (
          <HomePage onAddFirstPrize={addFirstPrize} soundEnabled={!isSoundPreferenceLoading && soundEnabled} />
        ) : null}
        {activeSection === "prizes" ? <PrizesPage openCreateOnMount={openPrizeCreation} /> : null}
        {activeSection === "settings" ? (
          <SettingsPage
            isSoundPreferenceLoading={isSoundPreferenceLoading}
            onOpenTulinStory={() => setIsTulinStoryOpen(true)}
            onSoundEnabledChange={updateSoundEnabled}
            soundEnabled={soundEnabled}
          />
        ) : null}
      </main>
      <PwaUpdatePrompt />
      <BottomNavigation activeSection={activeSection} onSectionChange={changeSection} />
      <Toaster />
    </div>
  )
}
