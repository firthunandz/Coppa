import React, { useEffect } from 'react'
import { User, Palette, Database, Rocket, Download, Trash2, Check, AlertTriangle } from 'lucide-react'
import { Header } from '../components/layout/Header'
import { useSettingsStore } from '../store/settingsStore'
import { useHabitStore } from '../store/habitStore'
import { useTaskStore } from '../store/taskStore'
import { useShoppingStore } from '../store/shoppingStore'
import { Button } from '../components/ui/Button'
import { ConfirmationModal } from '../components/ui/ConfirmationModal'

function hueToHex(hue: number): string {
  const h = hue / 360
  let r = 0, g = 0, b = 0
  const i = Math.floor(h * 6)
  const f = h * 6 - i
  const q = 1 - f
  const t = f
  if (i % 6 === 0) { r = 1; g = t; b = 0 }
  else if (i % 6 === 1) { r = q; g = 1; b = 0 }
  else if (i % 6 === 2) { r = 0; g = 1; b = t }
  else if (i % 6 === 3) { r = 0; g = q; b = 1 }
  else if (i % 6 === 4) { r = t; g = 0; b = 1 }
  else { r = 1; g = 0; b = q }
  const toHex = (x: number) => Math.round(x * 255).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export const SettingsPage: React.FC = () => {
  const { userName, setUserName, accentColor, setAccentColor } = useSettingsStore()
  const { habits } = useHabitStore()
  const { tasks } = useTaskStore()
  const { items: shoppingItems } = useShoppingStore()

  // Initialize hue state
  const [hue, setHue] = React.useState(20)
  const [showResetConfirm, setShowResetConfirm] = React.useState(false)

  // Update hue if accentColor changes from outside (e.g. initial load)
  // This is a simple approximation as we don't have hexToHue
  useEffect(() => {
    if (accentColor === '#d97757') setHue(20)
  }, [accentColor])

  const handleHueChange = (newHue: number) => {
    setHue(newHue)
    const newHex = hueToHex(newHue)
    setAccentColor(newHex)
  }

  const handleExportData = () => {
    const data = {
      habits,
      tasks,
      shoppingItems,
      settings: { userName, accentColor }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `coppa-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleResetData = () => {
    localStorage.clear()
    window.location.reload()
  }

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      <Header title="Ajustes" showDate={false} />

      <div className="max-w-2xl mx-auto space-y-10">
        {/* Perfil */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <User className="w-4 h-4 text-accent" />
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest">Perfil</h3>
          </div>
          <div className="bg-bg-secondary p-6 rounded-[32px] border border-border">
            <label className="block text-sm font-medium text-text-primary mb-2">Tu nombre</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="¿Cómo te llamas?"
              className="w-full bg-bg-tertiary border border-border rounded-2xl px-4 py-3 text-text-primary focus:outline-none focus:border-accent transition-colors"
            />
            <p className="mt-2 text-xs text-text-muted">Este nombre se usará en el saludo de la página principal.</p>
          </div>
        </section>

        {/* Apariencia */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Palette className="w-4 h-4 text-accent" />
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest">Apariencia</h3>
          </div>
          <div className="bg-bg-secondary p-6 rounded-[32px] border border-border space-y-8">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-6">Color de acento</label>
              
              <div className="space-y-6">
                <div className="relative px-2">
                  <input 
                    type="range" 
                    min={0} 
                    max={360} 
                    value={hue}
                    onChange={(e) => handleHueChange(Number(e.target.value))}
                    className="w-full h-3 rounded-full appearance-none cursor-pointer accent-white"
                    style={{
                      background: 'linear-gradient(to right, hsl(0,80%,55%), hsl(30,80%,55%), hsl(60,80%,55%), hsl(120,80%,55%), hsl(180,80%,55%), hsl(210,80%,55%), hsl(240,80%,55%), hsl(270,80%,55%), hsl(300,80%,55%), hsl(330,80%,55%), hsl(360,80%,55%))'
                    }}
                  />
                </div>

                <div className="flex items-center gap-4 bg-bg-tertiary/50 p-4 rounded-2xl border border-border">
                  <div 
                    className="w-12 h-12 rounded-xl shadow-lg border-2 border-white/20 transition-colors duration-300"
                    style={{ backgroundColor: accentColor }}
                  />
                  <div>
                    <div className="text-sm font-bold text-text-primary uppercase tracking-wider">{accentColor}</div>
                    <div className="text-[10px] text-text-muted uppercase tracking-wider font-medium">Color de acento actual</div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-3">Tema</label>
              <div className="grid grid-cols-3 gap-2 bg-bg-tertiary p-1 rounded-2xl border border-border">
                <button className="bg-bg-secondary text-text-primary py-2 rounded-xl text-xs font-bold shadow-sm">Oscuro</button>
                <button className="text-text-muted py-2 rounded-xl text-xs font-bold opacity-50 cursor-not-allowed flex items-center justify-center gap-1">
                  Claro <span className="text-[8px] bg-bg-tertiary px-1 rounded">PROX</span>
                </button>
                <button className="text-text-muted py-2 rounded-xl text-xs font-bold opacity-50 cursor-not-allowed flex items-center justify-center gap-1">
                  Sistema <span className="text-[8px] bg-bg-tertiary px-1 rounded">PROX</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Datos */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Database className="w-4 h-4 text-accent" />
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest">Datos</h3>
          </div>
          <div className="bg-bg-secondary p-6 rounded-[32px] border border-border space-y-4">
            <Button 
              variant="secondary" 
              className="w-full justify-start gap-3 h-14 rounded-2xl"
              onClick={handleExportData}
            >
              <Download className="w-5 h-5 text-accent" />
              <div className="text-left">
                <div className="text-sm font-bold">Exportar todos los datos</div>
                <div className="text-[10px] text-text-muted uppercase tracking-wider">Descargar archivo JSON</div>
              </div>
            </Button>

            <div className="pt-4 mt-4 border-t border-border">
              <h4 className="text-xs font-bold text-danger uppercase tracking-widest mb-3 px-1">Zona peligrosa</h4>
              <Button 
                variant="danger" 
                className="w-full justify-start gap-3 h-14 rounded-2xl bg-transparent border border-danger/20 hover:bg-danger/10"
                onClick={() => setShowResetConfirm(true)}
              >
                <Trash2 className="w-5 h-5" />
                <div className="text-left">
                  <div className="text-sm font-bold">Borrar todos los datos</div>
                  <div className="text-[10px] opacity-70 uppercase tracking-wider">Esta acción es irreversible</div>
                </div>
              </Button>
            </div>
          </div>
        </section>

        {/* Futuro */}
        <section className="space-y-4 opacity-60">
          <div className="flex items-center gap-2 px-1">
            <Rocket className="w-4 h-4 text-text-muted" />
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest">Próximamente</h3>
          </div>
          <div className="bg-bg-secondary/30 p-6 rounded-[32px] border border-border border-dashed space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <span className="text-sm text-text-muted">Sincronización con la nube (Supabase)</span>
              <span className="text-[8px] font-bold bg-bg-tertiary text-text-muted px-2 py-1 rounded-full border border-border">PRÓXIMAMENTE</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-text-muted">Notificaciones push</span>
              <span className="text-[8px] font-bold bg-bg-tertiary text-text-muted px-2 py-1 rounded-full border border-border">PRÓXIMAMENTE</span>
            </div>
          </div>
        </section>
      </div>

      <ConfirmationModal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleResetData}
        title="¿Borrar todos los datos?"
        description="Se borrarán todos tus hábitos, tareas y lista de compras. Esta acción es irreversible."
      />
    </div>
  )
}
