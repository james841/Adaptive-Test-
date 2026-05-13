import { useEffect, useState } from 'react'
import { AdminSidebar } from '@/components/AdminSidebar'
import { StatCard, SectionHeader, EmptyState } from '@/components/ui'
import { getAllSessions, getAllStudents, getAllItems, getEfficiencyStats } from '@/lib/api'
import type { TestSession, Student } from '@/types'

export default function AdminDashboard() {
  const [sessions,  setSessions]  = useState<TestSession[]>([])
  const [students,  setStudents]  = useState<Student[]>([])
  const [itemCount, setItemCount] = useState(0)
  const [stats,     setStats]     = useState<Awaited<ReturnType<typeof getEfficiencyStats>>>(null)
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([getAllSessions(), getAllStudents(), getAllItems(), getEfficiencyStats()])
      .then(([s, st, items, eff]) => {
        setSessions(s as unknown as TestSession[])
        setStudents(st)
        setItemCount(items.length)
        setStats(eff)
        setLoading(false)
      })
      .catch(error => {
        console.error('[AdminDashboard] failed to load dashboard data', error)
        setLoading(false)
      })
  }, [])

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <SectionHeader
          title="DASHBOARD"
          subtitle="System overview and key metrics"
        />

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard label="Total Students"   value={students.length}  />
          <StatCard label="Tests Completed"  value={sessions.length}  />
          <StatCard label="Items in Bank"    value={itemCount}        />
          <StatCard
            label="Avg Items / Test"
            value={stats ? stats.avgItems.toFixed(1) : '—'}
            sub="adaptive efficiency"
            dark
          />
        </div>

        {/* Ability distribution */}
        {stats && (
          <div className="mb-10">
            <p className="section-label mb-4">Ability Level Distribution</p>
            <div className="grid grid-cols-3 gap-4">
              {(['Low', 'Average', 'High'] as const).map(lvl => {
                const count = stats.distribution[lvl]
                const pct   = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0
                return (
                  <div key={lvl} className="border border-mist p-5">
                    <p className="section-label mb-2">{lvl}</p>
                    <p className="font-display text-4xl">{count}</p>
                    <div className="progress-track mt-3">
                      <div className="progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-xs font-mono text-steel mt-1">{pct}%</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Recent sessions */}
        <div>
          <p className="section-label mb-4">Recent Test Sessions</p>
          {loading ? (
            <p className="text-sm text-steel">Loading…</p>
          ) : sessions.length === 0 ? (
            <EmptyState message="No completed test sessions yet." />
          ) : (
            <div className="border border-mist overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>School</th>
                    <th>θ</th>
                    <th>SEM</th>
                    <th>Items</th>
                    <th>Level</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.slice(0, 10).map((s: any) => (
                    <tr key={s.id}>
                      <td className="font-medium">{s.students?.full_name ?? '—'}</td>
                      <td className="text-steel text-xs">{s.students?.school ?? '—'}</td>
                      <td className="font-mono text-xs">
                        {s.final_theta != null
                          ? `${s.final_theta >= 0 ? '+' : ''}${Number(s.final_theta).toFixed(2)}`
                          : '—'}
                      </td>
                      <td className="font-mono text-xs">
                        {s.final_sem != null ? Number(s.final_sem).toFixed(3) : '—'}
                      </td>
                      <td className="font-mono text-xs">{s.total_items_administered}</td>
                      <td>
                        {s.ability_level && (
                          <span
                            className={`badge ${
                              s.ability_level === 'High'
                                ? 'badge-high'
                                : s.ability_level === 'Low'
                                ? 'badge-low'
                                : 'badge-average'
                            }`}
                          >
                            {s.ability_level}
                          </span>
                        )}
                      </td>
                      <td className="text-xs text-steel">
                        {new Date(s.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
