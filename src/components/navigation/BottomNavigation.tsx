import { Gift, Home, Settings } from "lucide-react"

import type { MainSection } from "@/types/navigation"
import { cn } from "@/lib/utils"

type NavigationItem = {
  label: string
  section: MainSection
  icon: typeof Home
}

const navigationItems: NavigationItem[] = [
  { label: "Inicio", section: "home", icon: Home },
  { label: "Premios", section: "prizes", icon: Gift },
  { label: "Ajustes", section: "settings", icon: Settings },
]

type BottomNavigationProps = {
  activeSection: MainSection
  onSectionChange: (section: MainSection) => void
}

export function BottomNavigation({ activeSection, onSectionChange }: BottomNavigationProps) {
  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-md border-t border-border bg-surface pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="grid grid-cols-3">
        {navigationItems.map(({ icon: Icon, label, section }) => {
          const isActive = activeSection === section

          return (
            <li key={section}>
              <button
                type="button"
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex min-h-16 w-full flex-col items-center justify-center gap-1 px-2 text-xs font-bold transition-colors",
                  isActive ? "bg-brand-soft text-brand-active" : "text-text-secondary hover:text-brand",
                )}
                onClick={() => onSectionChange(section)}
              >
                <Icon aria-hidden="true" className="size-5" strokeWidth={2.25} />
                <span>{label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
