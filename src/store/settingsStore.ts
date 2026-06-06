import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsState {
  userName: string
  accentColor: string
  setUserName: (name: string) => void
  setAccentColor: (color: string) => void
  resetData: () => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      userName: '',
      accentColor: '#d97757',
      setUserName: (userName) => set({ userName }),
      setAccentColor: (accentColor) => {
        set({ accentColor })
        document.documentElement.style.setProperty('--color-accent', accentColor)
      },
      resetData: () => {
        // This will be implemented in SettingsPage to clear all stores
      },
    }),
    {
      name: 'coppa-settings',
    }
  )
)
