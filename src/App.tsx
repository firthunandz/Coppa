import { useState, useEffect } from 'react'

// One-time migration: ensure all habits/tasks/shopping items have tags array
try {
  const habitData = localStorage.getItem('coppa-habits')
  if (habitData) {
    const parsed = JSON.parse(habitData)
    if (parsed?.state?.habits) {
      parsed.state.habits = parsed.state.habits.map((h: any) => ({
        ...h,
        tags: Array.isArray(h.tags) ? h.tags : []
      }))
      localStorage.setItem('coppa-habits', JSON.stringify(parsed))
    }
  }
  const taskData = localStorage.getItem('coppa-tasks')
  if (taskData) {
    const parsed = JSON.parse(taskData)
    if (parsed?.state?.tasks) {
      parsed.state.tasks = parsed.state.tasks.map((t: any) => ({
        ...t,
        tags: Array.isArray(t.tags) ? t.tags : []
      }))
      localStorage.setItem('coppa-tasks', JSON.stringify(parsed))
    }
  }
  const shoppingData = localStorage.getItem('coppa-shopping')
  if (shoppingData) {
    const parsed = JSON.parse(shoppingData)
    if (parsed?.state?.items) {
      parsed.state.items = parsed.state.items.map((i: any) => ({
        ...i,
        tags: Array.isArray(i.tags) ? i.tags : []
      }))
      localStorage.setItem('coppa-shopping', JSON.stringify(parsed))
    }
  }
} catch (e) {
  console.warn('Migration failed', e)
}

import { Sidebar } from './components/layout/Sidebar'
import type { Page } from './components/layout/Sidebar'
import { TodayPage } from './pages/TodayPage'
import { HabitsPage } from './pages/HabitsPage'
import { TasksPage } from './pages/TasksPage'
import { useSettingsStore } from './store/settingsStore'

import { ShoppingPage } from './pages/ShoppingPage'
import { StatsPage } from './pages/StatsPage'
import { SettingsPage } from './pages/SettingsPage'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('today')
  const accentColor = useSettingsStore((s) => s.accentColor)

  useEffect(() => {
    document.documentElement.style.setProperty('--color-accent', accentColor)
  }, [accentColor])

  const renderPage = () => {
    switch (currentPage) {
      case 'today':
        return <TodayPage />
      case 'habits':
        return <HabitsPage />
      case 'tasks':
        return <TasksPage />
      case 'shopping':
        return <ShoppingPage />
      case 'stats':
        return <StatsPage />
      case 'settings':
        return <SettingsPage />
      default:
        return <TodayPage />
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary selection:bg-accent/30">
      <Sidebar currentPage={currentPage} setPage={setCurrentPage} />
      
      <main className="md:ml-64 p-6 pb-32 md:pb-10 min-h-screen max-w-7xl mx-auto transition-all duration-300">
        <div className="max-w-5xl mx-auto pt-4 md:pt-10">
          {renderPage()}
        </div>
      </main>
    </div>
  )
}

export default App
