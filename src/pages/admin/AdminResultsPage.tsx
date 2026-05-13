import { useEffect, useState } from 'react'
import { AdminSidebar } from '@/components/AdminSidebar'
import { SectionHeader, EmptyState, AbilityBadge } from '@/components/ui'
import { getAllSessions } from '@/lib/api'

export default function AdminResultsPage() {
  const [sessions, setSessions] = useState<any[]>([])
  const [loading,  setLoading]  = useState(true)
  const [filter,   setFilter]   = useState<'All' | 'Low' | 'Average' | 'High'>('All')

  useEffect(() => {
    getAllSessions().then(data => { setSessions(data); setLoading(false) })
  }, [])

  const filtered = filter === 'All'
    ? sessions
    : sessions.filter(s => s.ability_level === filter)

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <SectionHeader
          title="RESULTS"
          subtitle="All completed test sessions"
          action={
            <div className="flex gap-2">
              {(['All','Low','Average','High'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`text-xs px-3 py-1.5 border transition-colors ${
                    filter === f
                      ? 'bg-ink text-chalk border-ink'
                      : 'border-mist text-steel hover:border-ink hover:text-ink'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          }
        />

        {loading ? (
          <p className="text-sm text-steel">Loading…</p>
        ) : filtered.length === 0 ? (
          <EmptyState message="No results found for this filter." />
        ) : (
          <div className="border border-mist overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Student</th>
                  <th>School</th>
                  <th>Final θ</th>
                  <th>SEM</th>
                  <th>Items Used</th>
                  <th>Level</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr key={s.id}>
                    <td className="font-mono text-xs text-steel">{i + 1}</td>
                    <td className="font-medium">{s.students?.full_name ?? '—'}</td>
                    <td className="text-xs text-steel">{s.students?.school ?? '—'}</td>
                    <td className="font-mono text-xs">
                      {s.final_theta != null
                        ? `${Number(s.final_theta) >= 0 ? '+' : ''}${Number(s.final_theta).toFixed(2)}`
                        : '—'}
                    </td>
                    <td className="font-mono text-xs">
                      {s.final_sem != null ? Number(s.final_sem).toFixed(3) : '—'}
                    </td>
                    <td className="font-mono text-xs">{s.total_items_administered}</td>
                    <td><AbilityBadge level={s.ability_level} /></td>
                    <td className="text-xs text-steel">
                      {new Date(s.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
