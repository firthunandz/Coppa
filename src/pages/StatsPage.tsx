import React from 'react'
import { BarChart2, TrendingUp, CheckCircle2, LayoutGrid, Calendar, Award } from 'lucide-react'
import { Header } from '../components/layout/Header'
import { useHabitStore } from '../store/habitStore'
import { useTaskStore } from '../store/taskStore'
import { useSettingsStore } from '../store/settingsStore'
import { getCurrentStreak, getBestStreak } from '../utils/streakUtils'
import { getTodayStr } from '../utils/dateUtils'
import { subDays, format, isWithinInterval, startOfDay, parseISO } from 'date-fns'

export const StatsPage: React.FC = () => {
  const habits = useHabitStore(s => s.habits)
  const tasks = useTaskStore(s => s.tasks)
  const accentColor = useSettingsStore(s => s.accentColor)
  const todayStr = getTodayStr()

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '217, 119, 87'
  }
  
  const accentRgb = hexToRgb(accentColor)

  // --- Overview Data ---
  const highestCurrentStreak = habits.length > 0 
    ? Math.max(...habits.map(h => getCurrentStreak(h.completions)))
    : 0
  
  const activeHabitsCount = habits.filter(h => h.completions.length > 0).length
  const totalCompletedTasks = tasks.filter(t => t.completed).length

  const habitsDoneToday = habits.filter(h => h.completions.includes(todayStr)).length
  const tasksDoneToday = tasks.filter(t => t.completed && t.completedAt?.startsWith(todayStr)).length
  const tasksDueToday = tasks.filter(t => t.dueDate === todayStr || (!t.completed && t.dueDate && t.dueDate < todayStr)).length
  const totalTodayItems = habits.length + tasksDueToday
  const completionTodayPercent = totalTodayItems > 0 
    ? Math.round(((habitsDoneToday + tasksDoneToday) / totalTodayItems) * 100) 
    : 0

  // --- Habit Stats ---
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const d = subDays(new Date(), 29 - i)
    return format(d, 'yyyy-MM-dd')
  })

  const activityHeatmap = last30Days.map(date => {
    const completions = habits.filter(h => h.completions.includes(date)).length
    return { date, count: completions }
  })

  const maxDailyCompletions = Math.max(...activityHeatmap.map(a => a.count), 1)

  const topHabitsByStreak = [...habits]
    .map(h => ({ 
      ...h, 
      current: getCurrentStreak(h.completions),
      best: getBestStreak(h.completions)
    }))
    .sort((a, b) => b.current - a.current)
    .slice(0, 5)

  // --- Task Stats ---
  const tasksByPriority = {
    high: tasks.filter(t => !t.completed && t.priority === 'high').length,
    medium: tasks.filter(t => !t.completed && t.priority === 'medium').length,
    low: tasks.filter(t => !t.completed && t.priority === 'low').length,
  }

  const tasksCompletedThisWeek = tasks.filter(t => {
    if (!t.completed || !t.completedAt) return false
    const completedDate = parseISO(t.completedAt)
    return isWithinInterval(completedDate, {
      start: startOfDay(subDays(new Date(), 7)),
      end: new Date()
    })
  }).length

  const averageCompletionDays = React.useMemo(() => {
    const completedTasksWithDates = tasks.filter(t => t.completed && t.completedAt && t.createdAt)
    if (completedTasksWithDates.length === 0) return 0
    
    const totalDays = completedTasksWithDates.reduce((acc, t) => {
      const created = parseISO(t.createdAt).getTime()
      const completed = parseISO(t.completedAt!).getTime()
      return acc + (completed - created)
    }, 0)
    
    return Math.round(totalDays / (1000 * 60 * 60 * 24) / completedTasksWithDates.length)
  }, [tasks])

  // --- Motivation ---
  const getMotivationMessage = () => {
    if (completionTodayPercent >= 80) return "Día extraordinario. Seguí así."
    const bestStreak = habits.length > 0 ? Math.max(...habits.map(h => getBestStreak(h.completions))) : 0
    if (bestStreak >= 7) return "Tu racha habla por vos."
    if (tasksCompletedThisWeek >= 5) return "Semana productiva. Lo estás logrando."
    return "Cada día completado es un paso adelante."
  }

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      <Header title="Estadísticas" showDate={false} />

      {/* Overview Cards */}
      <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 mb-10">
        <StatCard label="Racha actual" value={highestCurrentStreak} icon={TrendingUp} color="text-accent" />
        <StatCard label="Hábitos activos" value={activeHabitsCount} icon={LayoutGrid} color="text-primary" />
        <StatCard label="Tareas completadas" value={totalCompletedTasks} icon={CheckCircle2} color="text-success" />
        <StatCard label="% completitud hoy" value={`${completionTodayPercent}%`} icon={Calendar} color="text-accent" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Habit Activity Heatmap */}
        <section className="bg-bg-secondary p-8 rounded-[32px] border border-border">
          <h3 className="text-xl font-display font-bold text-text-primary mb-6">Actividad (30 días)</h3>
          <div className="grid grid-cols-6 sm:grid-cols-10 gap-2">
            {activityHeatmap.map((day, i) => {
              const opacity = day.count === 0 ? 0 : Math.min(0.3 + (day.count / maxDailyCompletions) * 0.7, 1)
              return (
                <div 
                  key={i}
                  className="aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold border border-border/50 relative overflow-hidden group"
                  style={{ backgroundColor: day.count > 0 ? `rgba(${accentRgb}, ${opacity})` : 'var(--bg-tertiary)' }}
                >
                  <span className={day.count > 0 ? 'text-white' : 'text-text-muted'}>
                    {format(parseISO(day.date), 'd')}
                  </span>
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
                </div>
              )
            })}
          </div>
          <p className="mt-4 text-xs text-text-muted text-center italic">Opacidad basada en cantidad de hábitos completados</p>
        </section>

        {/* Top Habits by Streak */}
        <section className="bg-bg-secondary p-8 rounded-[32px] border border-border">
          <h3 className="text-xl font-display font-bold text-text-primary mb-6">Top hábitos por racha</h3>
          {topHabitsByStreak.length === 0 ? (
            <p className="text-text-muted text-sm italic py-10 text-center">No hay datos aún.</p>
          ) : (
            <div className="space-y-4">
              {topHabitsByStreak.map(h => (
                <div key={h.id} className="flex items-center justify-between p-3 bg-bg-tertiary/30 rounded-2xl border border-border/50">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{h.emoji}</span>
                    <span className="text-sm font-medium text-text-primary">{h.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-accent">{h.current} días</div>
                    <div className="text-[10px] text-text-muted uppercase tracking-wider">Mejor: {h.best}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Task Stats */}
        <section className="bg-bg-secondary p-8 rounded-[32px] border border-border">
          <h3 className="text-xl font-display font-bold text-text-primary mb-6">Tareas pendientes</h3>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <PriorityBox label="Alta" count={tasksByPriority.high} color="bg-danger/20 text-danger" />
            <PriorityBox label="Media" count={tasksByPriority.medium} color="bg-accent/20 text-accent" />
            <PriorityBox label="Baja" count={tasksByPriority.low} color="bg-success/20 text-success" />
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-text-primary">Completadas esta semana</h4>
                <p className="text-xs text-text-muted">Últimos 7 días</p>
              </div>
              <span className="text-2xl font-display font-bold text-accent">{tasksCompletedThisWeek}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-text-primary">Tiempo promedio</h4>
                <p className="text-xs text-text-muted">Desde creación a cierre</p>
              </div>
              <span className="text-2xl font-display font-bold text-accent">{averageCompletionDays} días</span>
            </div>
          </div>
        </section>

        {/* Habit Consistency */}
        <section className="bg-bg-secondary p-8 rounded-[32px] border border-border">
          <h3 className="text-xl font-display font-bold text-text-primary mb-6">Consistencia (esta semana)</h3>
          <div className="space-y-5">
            {habits.slice(0, 5).map(h => {
              const weekCells = getWeekCells(h.completions, h.frequency, h.customDays)
              const applicableDays = weekCells.filter(c => c.applicable).length
              const completedDays = weekCells.filter(c => c.applicable && c.completed).length
              
              let progress = 0
              let label = ""

              if (h.frequency === 'goal' && h.goal) {
                progress = (h.completions.length / h.goal.targetDays) * 100
                label = `${h.completions.length}/${h.goal.targetDays} días`
              } else {
                progress = (completedDays / Math.max(applicableDays, 1)) * 100
                label = `${completedDays}/${applicableDays} días`
              }

              const getFreqLabel = () => {
                if (h.frequency === 'daily' || !h.frequency) return 'D'
                if (h.frequency === 'weekdays') return 'L-V'
                if (h.frequency === 'goal') return 'G'
                return 'C'
              }

              return (
                <div key={h.id} className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-text-primary">{h.emoji} {h.name}</span>
                      <span className="text-[8px] font-bold bg-bg-tertiary px-1.5 py-0.5 rounded text-text-muted">{getFreqLabel()}</span>
                    </div>
                    <span className="text-text-muted">{label}</span>
                  </div>
                  <div className="h-2 w-full bg-bg-tertiary rounded-full overflow-hidden">
                    <div className="h-full bg-accent transition-all duration-1000" style={{ width: `${Math.min(progress, 100)}%` }} />
                  </div>
                </div>
              )
            })}
            {habits.length === 0 && <p className="text-text-muted text-sm italic text-center py-4">No hay hábitos aún.</p>}
          </div>
        </section>
      </div>

      {/* Motivational Footer */}
      <footer className="mt-16 text-center px-6">
        <Award className="w-12 h-12 text-accent/30 mx-auto mb-4" />
        <p className="text-2xl font-display italic text-text-primary max-w-md mx-auto leading-relaxed">
          "{getMotivationMessage()}"
        </p>
      </footer>
    </div>
  )
}

const StatCard: React.FC<{ label: string, value: string | number, icon: any, color: string }> = ({ label, value, icon: Icon, color }) => (
  <div className="flex-shrink-0 w-40 md:w-auto md:flex-1 bg-bg-secondary p-5 rounded-3xl border border-border">
    <div className={`w-10 h-10 rounded-2xl bg-bg-tertiary flex items-center justify-center mb-4 ${color}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div className="text-2xl font-display font-bold text-text-primary mb-1">{value}</div>
    <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{label}</div>
  </div>
)

const PriorityBox: React.FC<{ label: string, count: number, color: string }> = ({ label, count, color }) => (
  <div className={`p-4 rounded-2xl text-center ${color}`}>
    <div className="text-xl font-display font-bold">{count}</div>
    <div className="text-[10px] font-bold uppercase tracking-wider opacity-70">{label}</div>
  </div>
)
