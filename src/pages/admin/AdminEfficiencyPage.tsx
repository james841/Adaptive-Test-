import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid,
} from 'recharts'
import { AdminSidebar } from '@/components/AdminSidebar'
import { SectionHeader, StatCard, EmptyState } from '@/components/ui'
import { getAllSessions, getEfficiencyStats } from '@/lib/api'

const COLORS = ['#ef4444', '#eab308', '#22c55e']  // Low, Average, High

function fmtTime(ms: number) {
  const s = Math.round(ms / 1000)
  if (s < 60) return `${s}s`
  return `${Math.floor(s / 60)}m ${s % 60}s`
}

export default function AdminEfficiencyPage() {
  const [stats,    setStats]    = useState<Awaited<ReturnType<typeof getEfficiencyStats>>>(null)
  const [sessions, setSessions] = useState<any[]>([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    Promise.all([getEfficiencyStats(), getAllSessions()]).then(([s, sess]) => {
      setStats(s)
      setSessions(sess)
      setLoading(false)
    })
  }, [])

  if (loading) return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <p className="text-sm text-steel">Calculating efficiency metrics…</p>
      </main>
    </div>
  )

  const pieData = stats ? [
    { name: 'Low',     value: stats.distribution.Low     },
    { name: 'Average', value: stats.distribution.Average },
    { name: 'High',    value: stats.distribution.High    },
  ] : []

  // Items administered histogram
  const itemFreq: Record<number, number> = {}
  sessions.forEach(s => {
    const n = s.total_items_administered
    itemFreq[n] = (itemFreq[n] ?? 0) + 1
  })
  const histData = Object.entries(itemFreq)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([items, count]) => ({ items: `${items} items`, count }))

  // SEM over sessions (chronological)
  const semTrend = sessions
    .slice(-20)
    .map((s, i) => ({
      session: i + 1,
      sem: s.final_sem != null ? Number(s.final_sem).toFixed(3) : null,
    }))
    .filter(d => d.sem !== null)

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <SectionHeader
          title="EFFICIENCY REPORT"
          subtitle="CAT system performance metrics"
        />

        {!stats ? (
          <EmptyState message="No completed tests yet. Efficiency data will appear after students take the test." />
        ) : (
          <>
            {/* Key metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              <StatCard
                label="Total Tests"
                value={stats.total}
              />
              <StatCard
                label="Avg Items / Test"
                value={stats.avgItems.toFixed(1)}
                sub="lower = more efficient"
                dark
              />
              <StatCard
                label="Avg SEM"
                value={stats.avgSem.toFixed(3)}
                sub="target ≤ 0.30"
              />
              <StatCard
                label="Avg Test Time"
                value={fmtTime(stats.avgTimeMs)}
              />
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
              {/* Items administered histogram */}
              <div className="border border-mist p-5">
                <p className="section-label mb-4">Items Administered (Distribution)</p>
                {histData.length === 0 ? (
                  <EmptyState message="No data yet." />
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={histData}>
                      <XAxis dataKey="items" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} />
                      <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#0a0a0a" radius={[2,2,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Ability distribution pie */}
              <div className="border border-mist p-5">
                <p className="section-label mb-4">Ability Level Distribution</p>
                {pieData.every(d => d.value === 0) ? (
                  <EmptyState message="No data yet." />
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                        labelLine={false}
                      >
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* SEM trend */}
            {semTrend.length > 1 && (
              <div className="border border-mist p-5 mb-10">
                <p className="section-label mb-1">Final SEM Trend (last 20 sessions)</p>
                <p className="text-xs text-steel mb-4">Lower SEM = more precise measurement</p>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={semTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e4" />
                    <XAxis dataKey="session" tick={{ fontSize: 10 }} label={{ value: 'Session', position: 'insideBottom', offset: -2, fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} domain={[0, 1]} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="sem"
                      stroke="#0a0a0a"
                      strokeWidth={2}
                      dot={{ r: 3, fill: '#0a0a0a' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Summary note */}
            <div className="border border-mist p-6 bg-paper">
              <p className="section-label mb-2">Interpretation</p>
              <div className="space-y-2 text-sm text-steel leading-relaxed">
                <p>
                  <strong className="text-ink">Average items administered:</strong>{' '}
                  {stats.avgItems.toFixed(1)} items (out of {10} max). 
                  {stats.avgItems < 8 ? ' ✓ The CAT is efficient — terminating early for most students.' : ' Test is running to near maximum length.'}
                </p>
                <p>
                  <strong className="text-ink">Average SEM:</strong> {stats.avgSem.toFixed(3)} logits.
                  {stats.avgSem <= 0.40 ? ' ✓ Within acceptable precision range (≤ 0.40).' : ' ⚠ Consider adding more items to improve precision.'}
                </p>
                <p>
                  <strong className="text-ink">Average theta:</strong>{' '}
                  {stats.avgTheta >= 0 ? '+' : ''}{stats.avgTheta.toFixed(2)} logits.
                  {Math.abs(stats.avgTheta) < 0.3 ? ' Items are well-targeted to the sample.' : ' Item bank may need calibration adjustment.'}
                </p>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
