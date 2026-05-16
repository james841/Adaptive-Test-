import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid,
} from 'recharts'
import { AdminSidebar } from '@/components/AdminSidebar'
import { SectionHeader, StatCard, EmptyState } from '@/components/ui'
import { getAllSessions, getEfficiencyStats } from '@/lib/api'
import { AlertCircle, CheckCircle2, TrendingDown, Clock, Layers } from 'lucide-react'

const COLORS = ['#f43f5e', '#f59e0b', '#10b981'] // Rose, Amber, Emerald

function fmtTime(ms: number) {
  const s = Math.round(ms / 1000)
  if (s < 60) return `${s}s`
  return `${Math.floor(s / 60)}m ${s % 60}s`
}

export default function AdminEfficiencyPage() {
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getEfficiencyStats>>>(null)
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getEfficiencyStats(), getAllSessions()]).then(([s, sess]) => {
      setStats(s)
      setSessions(sess)
      setLoading(false)
    })
  }, [])

  if (loading) return (
    <div className="flex min-h-screen bg-slate-50/50">
      <AdminSidebar />
      <main className="flex-1 p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
          <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">Calculating Metrics</p>
        </div>
      </main>
    </div>
  )

  const pieData = stats ? [
    { name: 'Low', value: stats.distribution.Low },
    { name: 'Average', value: stats.distribution.Average },
    { name: 'High', value: stats.distribution.High },
  ] : []

  const itemFreq: Record<number, number> = {}
  sessions.forEach(s => {
    const n = s.total_items_administered
    itemFreq[n] = (itemFreq[n] ?? 0) + 1
  })
  
  const histData = Object.entries(itemFreq)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([items, count]) => ({ items: `${items} items`, count }))

  const semTrend = sessions
    .slice(-20)
    .map((s, i) => ({
      session: i + 1,
      sem: s.final_sem != null ? Number(Number(s.final_sem).toFixed(3)) : null,
    }))
    .filter(d => d.sem !== null)

  return (
    <div className="flex min-h-screen bg-slate-50/50 text-slate-900">
      <AdminSidebar />
      <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full overflow-y-auto">
        <SectionHeader
          title="Efficiency Report"
          subtitle="CAT (Computer Adaptive Testing) performance & precision analytics"
        />

        {!stats ? (
          <EmptyState message="No completed tests yet. Efficiency data will appear after student activity." />
        ) : (
          <div className="space-y-8 mt-6">
            {/* Stat Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard label="Total Tests" value={stats.total} />
              <StatCard 
                label="Efficiency" 
                value={stats.avgItems.toFixed(1)} 
                sub="Avg Items administered" 
              />
              <StatCard 
                label="Precision (SEM)" 
                value={stats.avgSem.toFixed(3)} 
                sub="Target ≤ 0.30" 
              />
              <StatCard label="Avg Duration" value={fmtTime(stats.avgTimeMs)} />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Histogram */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-6 flex items-center gap-2">
                  Test Length Frequency
                </h3>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={histData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="items" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                      <Tooltip 
                        cursor={{ fill: '#f8fafc' }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                      />
                      <Bar dataKey="count" fill="#0f172a" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pie Distribution */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-6">
                  Ability Level Breakdown
                </h3>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={8}
                        dataKey="value"
                        stroke="none"
                      >
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Legend */}
                  <div className="flex justify-center gap-6 mt-2">
                    {pieData.map((d, i) => (
                      <div key={d.name} className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                        <span className="text-xs font-medium text-slate-600">{d.name} ({d.value})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Line Trend */}
            {semTrend.length > 1 && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="mb-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Precision Stability</h3>
                  <p className="text-xs text-slate-400">Final SEM tracking for the last 20 sessions</p>
                </div>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={semTrend}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="session" hide />
                      <YAxis domain={[0, 1]} axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="sem" 
                        stroke="#0f172a" 
                        strokeWidth={3} 
                        dot={{ r: 4, fill: '#0f172a', strokeWidth: 2, stroke: '#fff' }} 
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Smart Interpretation */}
            <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-xl overflow-hidden relative">
              <div className="relative z-10">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">Automated Insights</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <InsightItem 
                    title="Adaptivity"
                    val={`${stats.avgItems.toFixed(1)} items`}
                    desc={stats.avgItems < 8 ? "System is terminating early, effectively reducing student fatigue." : "Test length is approaching max; consider recalibrating items."}
                    isGood={stats.avgItems < 8}
                  />
                  <InsightItem 
                    title="Measurement"
                    val={`${stats.avgSem.toFixed(3)} SEM`}
                    desc={stats.avgSem <= 0.4 ? "Measurement precision is within high-reliability bounds." : "Precision is slightly low. Adding more items to the bank may help."}
                    isGood={stats.avgSem <= 0.4}
                  />
                  <InsightItem 
                    title="Targeting"
                    val={`${stats.avgTheta.toFixed(2)} logit`}
                    desc={Math.abs(stats.avgTheta) < 0.5 ? "Item difficulty is perfectly centered on student ability." : "Bank skew detected. Adjust item selection for better coverage."}
                    isGood={Math.abs(stats.avgTheta) < 0.5}
                  />
                </div>
              </div>
              {/* Decorative background circle */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function InsightItem({ title, val, desc, isGood }: { title: string, val: string, desc: string, isGood: boolean }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {isGood ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-amber-400" />}
        <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{title}</span>
      </div>
      <div className="text-xl font-mono font-bold tracking-tight text-white">{val}</div>
      <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
    </div>
  )
}