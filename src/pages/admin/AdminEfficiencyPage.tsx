import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, ReferenceLine,
} from 'recharts'
import { AdminSidebar } from '@/components/AdminSidebar'
import { EmptyState } from '@/components/ui'
import { getAllSessions, getEfficiencyStats } from '@/lib/api'
import { AlertCircle, CheckCircle2, TrendingUp, Clock, Layers, Target, BarChart2, Users } from 'lucide-react'
import { CAT_CONFIG } from '@/lib/catEngine'

// ─── Constants ────────────────────────────────────────────────────────────────
const ABILITY_COLORS = {
  Low:     '#f43f5e',
  Average: '#f59e0b',
  High:    '#10b981',
}
const ADAPTIVITY_GOOD = CAT_CONFIG.MAX_ITEMS * 0.6
const SEM_GOOD        = CAT_CONFIG.SEM_THRESHOLD

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmtDuration(ms: number): string {
  if (!isFinite(ms) || ms < 0) return '—'
  const totalSeconds = Math.round(ms / 1000)
  if (totalSeconds < 60) return `${totalSeconds}s`
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  if (minutes < 60) return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const mins  = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

function safeDurationMs(startTime: string | null, endTime: string | null): number | null {
  if (!startTime || !endTime) return null
  const start = new Date(startTime).getTime()
  const end   = new Date(endTime).getTime()
  if (isNaN(start) || isNaN(end) || end <= start) return null
  const ms = end - start
  if (ms > 1000 * 60 * 180) return null
  return ms
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Thin horizontal rule with label — used as section dividers */
function Rule({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 py-2">
      <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400 whitespace-nowrap">{label}</span>
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  )
}

/** Single KPI block — used in the top metrics strip */
function Kpi({
  label, value, sub, icon, accent = false,
}: {
  label: string; value: string | number; sub?: string
  icon: React.ReactNode; accent?: boolean
}) {
  return (
    <div className={`rounded-2xl p-5 flex flex-col gap-3 border ${
      accent
        ? 'bg-slate-900 border-slate-800 text-white'
        : 'bg-white border-slate-200 text-slate-900'
    }`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
        accent ? 'bg-white/10' : 'bg-slate-100'
      }`}>
        <span className={accent ? 'text-white' : 'text-slate-500'}>{icon}</span>
      </div>
      <div>
        <p className={`text-2xl font-bold tracking-tight tabular-nums ${accent ? 'text-white' : 'text-slate-900'}`}>
          {value}
        </p>
        <p className={`text-xs font-semibold mt-0.5 ${accent ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
        {sub && <p className={`text-[10px] mt-0.5 ${accent ? 'text-slate-500' : 'text-slate-400'}`}>{sub}</p>}
      </div>
    </div>
  )
}

/** Insight card in the bottom panel */
function InsightCard({ title, val, desc, isGood }: {
  title: string; val: string; desc: string; isGood: boolean
}) {
  return (
    <div className="flex flex-col gap-3 p-5 rounded-xl bg-white/5 border border-white/10">
      <div className="flex items-center gap-2">
        {isGood
          ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          : <AlertCircle  className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
        <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400">{title}</span>
      </div>
      <p className="text-2xl font-mono font-bold text-white tracking-tight">{val}</p>
      <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
    </div>
  )
}

/** Tooltip shared across charts */
function ChartTip({ active, payload, label, formatter }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 shadow-xl text-xs min-w-[100px]">
      {label && <p className="font-semibold text-slate-600 mb-1">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-slate-800 font-medium">
          {formatter ? formatter(p.value, p.name) : `${p.name}: ${p.value}`}
        </p>
      ))}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
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
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <main className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-[3px] border-slate-200 border-t-slate-900 rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Computing metrics…</p>
        </div>
      </main>
    </div>
  )

  // ── Derived chart data ─────────────────────────────────────────────────────
  const pieData = stats
    ? (['Low', 'Average', 'High'] as const).map(k => ({ name: k, value: stats.distribution[k] }))
    : []

  const itemFreq: Record<number, number> = {}
  sessions.forEach(s => {
    const n = s.total_items_administered
    if (n != null) itemFreq[n] = (itemFreq[n] ?? 0) + 1
  })
  const histData = Object.entries(itemFreq)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([items, count]) => ({ items, count }))

  const semTrend = sessions
    .slice(-20)
    .map((s, i) => {
      const sem = s.final_sem != null ? Number(s.final_sem) : null
      return { n: i + 1, sem: sem != null && sem <= 2 ? +sem.toFixed(3) : null }
    })
    .filter(d => d.sem !== null)

  const validDurations = sessions
    .map(s => safeDurationMs(s.start_time, s.end_time))
    .filter((d): d is number => d !== null)
  const safeAvgMs = validDurations.length > 0
    ? validDurations.reduce((a, b) => a + b, 0) / validDurations.length
    : null

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <AdminSidebar />

      <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full overflow-y-auto space-y-8">

        {/* ── Page header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400 mb-1">CAT Analytics</p>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Efficiency Report</h1>
            <p className="text-sm text-slate-500 mt-1">
              Measurement precision and adaptivity across {sessions.length} completed session{sessions.length !== 1 ? 's' : ''}
            </p>
          </div>
          {stats && (
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full w-fit">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              System active
            </div>
          )}
        </div>

        {!stats ? (
          <EmptyState message="No completed tests yet. Efficiency data will appear after students complete sessions." />
        ) : (<>

          {/* ── KPI strip ── */}
          <Rule label="Key metrics" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <Kpi
              label="Sessions"
              value={stats.total}
              icon={<Users className="w-4 h-4" />}
            />
            <Kpi
              label="Avg items / test"
              value={stats.avgItems.toFixed(1)}
              sub={`Cap: ${CAT_CONFIG.MAX_ITEMS}`}
              icon={<Layers className="w-4 h-4" />}
              accent={stats.avgItems >= ADAPTIVITY_GOOD}
            />
            <Kpi
              label="Avg SEM"
              value={stats.avgSem.toFixed(3)}
              sub={`Target ≤ ${SEM_GOOD}`}
              icon={<Target className="w-4 h-4" />}
              accent={stats.avgSem > SEM_GOOD}
            />
            <Kpi
              label="Avg duration"
              value={safeAvgMs !== null ? fmtDuration(safeAvgMs) : '—'}
              sub="Time per session"
              icon={<Clock className="w-4 h-4" />}
            />
            <Kpi
              label="Avg TIF"
              value={stats.avgTif.toFixed(2)}
              sub="1 / SEM²"
              icon={<BarChart2 className="w-4 h-4" />}
            />
            <Kpi
              label="Avg θ"
              value={`${stats.avgTheta >= 0 ? '+' : ''}${stats.avgTheta.toFixed(2)}`}
              sub="Mean ability"
              icon={<TrendingUp className="w-4 h-4" />}
            />
          </div>

          {/* ── Charts row ── */}
          <Rule label="Distributions" />
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

            {/* Test length histogram — wider */}
            <div className="xl:col-span-3 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="mb-5">
                <h3 className="text-sm font-bold text-slate-800">Test length distribution</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  How many items each session required before stopping — shorter means the CAT converged faster
                </p>
              </div>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={histData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="items"
                      axisLine={false} tickLine={false}
                      tick={{ fontSize: 10, fill: '#94a3b8' }}
                    />
                    <YAxis
                      axisLine={false} tickLine={false}
                      tick={{ fontSize: 10, fill: '#94a3b8' }}
                      allowDecimals={false}
                    />
                    <Tooltip
                      content={<ChartTip formatter={(v: number, n: string) => `${v} session${v !== 1 ? 's' : ''}`} />}
                      cursor={{ fill: '#f8fafc' }}
                    />
                    <ReferenceLine
                      x={String(CAT_CONFIG.MIN_ITEMS)}
                      stroke="#f59e0b" strokeDasharray="4 3"
                      label={{ value: 'min', position: 'top', fontSize: 9, fill: '#f59e0b' }}
                    />
                    <Bar dataKey="count" name="Sessions" fill="#0f172a" radius={[5, 5, 0, 0]} maxBarSize={44} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Ability pie — narrower */}
            <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-slate-800">Ability classification</h3>
                <p className="text-xs text-slate-400 mt-0.5">Based on final θ at session end</p>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        innerRadius={48}
                        outerRadius={76}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                        startAngle={90}
                        endAngle={-270}
                      >
                        {pieData.map((d) => (
                          <Cell key={d.name} fill={ABILITY_COLORS[d.name as keyof typeof ABILITY_COLORS]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(v: number, name: string) => [
                          `${v} student${v !== 1 ? 's' : ''} (${stats.total > 0 ? Math.round((v / stats.total) * 100) : 0}%)`,
                          name
                        ]}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend rows */}
                <div className="w-full space-y-2">
                  {pieData.map(d => {
                    const pct = stats.total > 0 ? Math.round((d.value / stats.total) * 100) : 0
                    return (
                      <div key={d.name} className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: ABILITY_COLORS[d.name as keyof typeof ABILITY_COLORS] }}
                        />
                        <span className="text-xs text-slate-600 flex-1">{d.name}</span>
                        <span className="text-xs font-bold text-slate-800 tabular-nums">{d.value}</span>
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: ABILITY_COLORS[d.name as keyof typeof ABILITY_COLORS],
                            }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 tabular-nums w-8 text-right">{pct}%</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* ── SEM trend ── */}
          {semTrend.length > 1 && (<>
            <Rule label="Precision trend" />
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-5">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">SEM across sessions</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Standard Error of Measurement for the last {semTrend.length} sessions — dots below the green line hit the precision target
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 shrink-0">
                  <div className="w-5 border-t-2 border-dashed border-emerald-500" />
                  <span>Target ≤ {SEM_GOOD}</span>
                </div>
              </div>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={semTrend} margin={{ top: 8, right: 12, left: -24, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="n"
                      axisLine={false} tickLine={false}
                      tick={{ fontSize: 10, fill: '#94a3b8' }}
                      label={{ value: 'Session', position: 'insideBottom', offset: -1, fontSize: 10, fill: '#94a3b8' }}
                    />
                    <YAxis
                      domain={[0, 0.8]}
                      axisLine={false} tickLine={false}
                      tick={{ fontSize: 10, fill: '#94a3b8' }}
                      tickCount={5}
                    />
                    <Tooltip
                      content={<ChartTip formatter={(v: number) => `SEM ${v.toFixed(3)}`} />}
                    />
                    <ReferenceLine
                      y={SEM_GOOD}
                      stroke="#10b981" strokeDasharray="5 4" strokeWidth={1.5}
                      label={{ value: `${SEM_GOOD}`, position: 'right', fontSize: 9, fill: '#10b981' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="sem"
                      stroke="#0f172a"
                      strokeWidth={2.5}
                      dot={{ r: 3.5, fill: '#0f172a', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 5, fill: '#0f172a' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>)}

          {/* ── Automated insights ── */}
          <Rule label="Automated insights" />
          <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-xl relative">
            {/* Decorative blobs */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -mr-40 -mt-40 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-blue-500/5 rounded-full -ml-20 -mb-20 blur-2xl pointer-events-none" />

            <div className="relative z-10 p-8">
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500 mb-5">
                Psychometric interpretation
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InsightCard
                  title="Adaptivity"
                  val={`${stats.avgItems.toFixed(1)} items`}
                  isGood={stats.avgItems < ADAPTIVITY_GOOD}
                  desc={
                    stats.avgItems < ADAPTIVITY_GOOD
                      ? `Test length is well below the ${CAT_CONFIG.MAX_ITEMS}-item cap. The algorithm is converging efficiently.`
                      : `Average test length is high (cap: ${CAT_CONFIG.MAX_ITEMS}). Adding more items near students' ability range may speed convergence.`
                  }
                />
                <InsightCard
                  title="Measurement precision"
                  val={`${stats.avgSem.toFixed(3)} SEM`}
                  isGood={stats.avgSem <= SEM_GOOD}
                  desc={
                    stats.avgSem <= SEM_GOOD
                      ? `Within target (≤ ${SEM_GOOD}). Ability estimates are reliable for reporting.`
                      : `Above target of ${SEM_GOOD}. Consider expanding the item bank near θ ≈ ${stats.avgTheta.toFixed(1)}.`
                  }
                />
                <InsightCard
                  title="Item targeting"
                  val={`${stats.avgTheta >= 0 ? '+' : ''}${stats.avgTheta.toFixed(2)} logit`}
                  isGood={Math.abs(stats.avgTheta) < 0.5}
                  desc={
                    Math.abs(stats.avgTheta) < 0.5
                      ? "Item difficulty is well centred on student ability. No systematic bias detected."
                      : `Average θ skews ${stats.avgTheta > 0 ? 'high' : 'low'}. Add more ${stats.avgTheta > 0 ? 'harder' : 'easier'} items to reduce targeting error.`
                  }
                />
              </div>

              {/* Duration footnote */}
              {safeAvgMs !== null && (
                <div className="mt-6 pt-5 border-t border-white/10 flex items-center gap-3">
                  <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <p className="text-xs text-slate-400">
                    Students spend an average of{' '}
                    <span className="text-white font-semibold">{fmtDuration(safeAvgMs)}</span>{' '}
                    per session — the time from their first question to the CAT stopping rule firing.
                    {validDurations.length < sessions.length && (
                      <span className="ml-1 opacity-50">
                        ({sessions.length - validDurations.length} session{sessions.length - validDurations.length > 1 ? 's' : ''} with missing timestamps excluded.)
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>

        </>)}
      </main>
    </div>
  )
}