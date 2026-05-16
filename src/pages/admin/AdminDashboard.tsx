import { useEffect, useState } from 'react'
import { AdminSidebar } from '@/components/AdminSidebar'
import { StatCard, SectionHeader, EmptyState } from '@/components/ui'
import { getAllSessions, getAllStudents, getAllItems, getEfficiencyStats } from '@/lib/api'
import type { TestSession, Student } from '@/types'
import { Users, FileText, Database, Activity, Calendar } from 'lucide-react' // Icons add visual cues

export default function AdminDashboard() {
  const [sessions, setSessions] = useState<TestSession[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [itemCount, setItemCount] = useState(0)
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getEfficiencyStats>>>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [s, st, items, eff] = await Promise.all([
          getAllSessions(),
          getAllStudents(),
          getAllItems(),
          getEfficiencyStats()
        ])
        setSessions(s as unknown as TestSession[])
        setStudents(st)
        setItemCount(items.length)
        setStats(eff)
      } catch (error) {
        console.error('[AdminDashboard] failed to load dashboard data', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <AdminSidebar />
      
      <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full transition-all">
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <SectionHeader
            title="Dashboard"
            subtitle="Real-time psychometric oversight and system health"
          />
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm w-fit">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Live System Status
          </div>
        </header>

        {/* Primary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard 
            label="Total Students" 
            value={loading ? '...' : students.length} 
            icon={<Users className="w-4 h-4" />}
          />
          <StatCard 
            label="Tests Completed" 
            value={loading ? '...' : sessions.length} 
            icon={<FileText className="w-4 h-4" />}
          />
          <StatCard 
            label="Items in Bank" 
            value={loading ? '...' : itemCount} 
            icon={<Database className="w-4 h-4" />}
          />
          <StatCard
            label="Avg Items / Test"
            value={stats ? stats.avgItems.toFixed(1) : '—'}
            icon={<Activity className="w-4 h-4" />}
            className="bg-slate-900 text-white" // Highlighting important efficiency metric
            sub="Adaptive Load"
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Distribution Column */}
          <section className="xl:col-span-1">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
              Ability Distribution
            </h3>
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col gap-6">
              {stats ? (
                (['High', 'Average', 'Low'] as const).map(lvl => {
                  const count = stats.distribution[lvl]
                  const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0
                  const colorMap = { High: 'bg-emerald-500', Average: 'bg-blue-500', Low: 'bg-amber-500' }
                  
                  return (
                    <div key={lvl} className="space-y-2">
                      <div className="flex justify-between items-end">
                        <span className="text-sm font-medium text-slate-600">{lvl}</span>
                        <span className="text-2xl font-bold tracking-tight">{count}</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${colorMap[lvl]}`} 
                          style={{ width: `${pct}%` }} 
                        />
                      </div>
                      <p className="text-[10px] font-mono text-slate-400 uppercase">{pct}% of total population</p>
                    </div>
                  )
                })
              ) : (
                <div className="animate-pulse space-y-6">
                  {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-lg" />)}
                </div>
              )}
            </div>
          </section>

          {/* Recent Sessions Table */}
          <section className="xl:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
                Recent Test Sessions
              </h3>
              <button className="text-xs text-blue-600 hover:underline font-medium">View All</button>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              {loading ? (
                <div className="p-8 space-y-4">
                   {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-8 bg-slate-50 rounded" />)}
                </div>
              ) : sessions.length === 0 ? (
                <EmptyState message="No completed test sessions yet." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-widest text-slate-500">
                        <th className="px-6 py-4 font-semibold">Student & School</th>
                        <th className="px-6 py-4 font-semibold text-center">θ (Theta)</th>
                        <th className="px-6 py-4 font-semibold text-center">Items</th>
                        <th className="px-6 py-4 font-semibold">Level</th>
                        <th className="px-6 py-4 font-semibold text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sessions.slice(0, 8).map((s: any) => (
                        <tr key={s.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="text-sm font-semibold text-slate-800">{s.students?.full_name}</div>
                            <div className="text-xs text-slate-400">{s.students?.school}</div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                              {s.final_theta != null ? (s.final_theta >= 0 ? '+' : '') + Number(s.final_theta).toFixed(2) : '—'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center text-sm text-slate-600 font-medium">
                            {s.total_items_administered}
                          </td>
                          <td className="px-6 py-4">
                            <Badge level={s.ability_level} />
                          </td>
                          <td className="px-6 py-4 text-right text-xs text-slate-400 font-mono">
                            {new Date(s.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

function Badge({ level }: { level: string }) {
  const styles = {
    High: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    Average: 'bg-blue-50 text-blue-700 border-blue-100',
    Low: 'bg-amber-50 text-amber-700 border-amber-100'
  }
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${styles[level as keyof typeof styles] || 'bg-slate-50 text-slate-600'}`}>
      {level.toUpperCase()}
    </span>
  )
}