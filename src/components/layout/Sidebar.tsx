import React from 'react'
import { Calendar, CheckCircle2, ListTodo, LayoutGrid, ShoppingCart, BarChart2, Settings as SettingsIcon } from 'lucide-react'

export type Page = 'today' | 'habits' | 'tasks' | 'shopping' | 'stats' | 'settings'

interface SidebarProps {
  currentPage: Page
  setPage: (page: Page) => void
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, setPage }) => {
  const navItems = [
    { id: 'today' as Page, label: 'Hoy', icon: Calendar },
    { id: 'habits' as Page, label: 'Hábitos', icon: LayoutGrid },
    { id: 'tasks' as Page, label: 'Tareas', icon: ListTodo },
    { id: 'shopping' as Page, label: 'Compras', icon: ShoppingCart },
  ]

  const secondaryNavItems = [
    { id: 'stats' as Page, label: 'Estadísticas', icon: BarChart2 },
  ]

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen bg-bg-secondary border-r border-border p-6 fixed left-0 top-0">
        <div className="flex items-center gap-2 mb-10 px-2">
          <img src="/Coppa/coppalogo.png" alt="Coppa" className="w-7 h-7 object-contain" />
          <h1 className="text-2xl font-display font-bold text-text-primary tracking-tight">Coppa</h1>
        </div>
        
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.id
            return (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-accent/10 text-accent font-semibold' 
                    : 'text-text-muted hover:text-text-primary hover:bg-bg-tertiary'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-accent' : ''}`} />
                <span>{item.label}</span>
              </button>
            )
          })}
          
          <div className="pt-6 pb-2 px-4">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Análisis</p>
          </div>
          
          {secondaryNavItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.id
            return (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-accent/10 text-accent font-semibold' 
                    : 'text-text-muted hover:text-text-primary hover:bg-bg-tertiary'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-accent' : ''}`} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="pt-6 border-t border-border">
          <button
            onClick={() => setPage('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              currentPage === 'settings' 
                ? 'bg-accent/10 text-accent font-semibold' 
                : 'text-text-muted hover:text-text-primary hover:bg-bg-tertiary'
            }`}
          >
            <SettingsIcon className={`w-5 h-5 ${currentPage === 'settings' ? 'text-accent' : ''}`} />
            <span>Ajustes</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-bg-secondary border-t border-border flex items-center justify-around p-4 z-40 backdrop-blur-lg bg-opacity-90">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPage === item.id
          return (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`flex flex-col items-center gap-1 transition-all ${
                isActive ? 'text-accent' : 'text-text-muted'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Mobile Header with Settings and Stats icons */}
      <div className="md:hidden fixed top-0 left-0 right-0 p-4 flex items-center justify-between z-40">
        <div className="flex items-center gap-2">
          <img src="/Coppa/coppalogo.png" alt="Coppa" className="w-8 h-8 object-contain" />
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setPage('stats')}
            className={`p-2 rounded-full ${currentPage === 'stats' ? 'bg-accent/10 text-accent' : 'bg-bg-secondary/80 text-text-muted backdrop-blur-sm'}`}
          >
            <BarChart2 className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setPage('settings')}
            className={`p-2 rounded-full ${currentPage === 'settings' ? 'bg-accent/10 text-accent' : 'bg-bg-secondary/80 text-text-muted backdrop-blur-sm'}`}
          >
            <SettingsIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </>
  )
}
