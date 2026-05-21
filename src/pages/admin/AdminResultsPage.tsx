import { useEffect, useState } from 'react'
import { AdminSidebar } from '@/components/AdminSidebar'
import { SectionHeader, EmptyState, AbilityBadge } from '@/components/ui'
import { getAllSessions } from '@/lib/api'
import { BarChart3, Filter } from 'lucide-react'

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
    <div className="flex min-h-screen bg-slate-50/50">
      <AdminSidebar />
      <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-purple-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900">Test Results</h1>
            </div>
            <p className="text-slate-600">All completed test sessions and student outcomes</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-slate-900">{sessions.length}</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Total Tests</p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <div className="flex items-center gap-2 text-slate-600">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filter by Ability:</span>
          </div>
          {(['All','Low','Average','High'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                filter === f
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-12 bg-slate-50 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState message={filter !== 'All' ? `No ${filter} ability results found.` : "No test results found."} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200 text-[11px] uppercase tracking-widest text-slate-500 font-semibold">
                    <th className="px-6 py-4">#</th>
                    <th className="px-6 py-4">Student Name</th>
                    <th className="px-6 py-4">School</th>
                    <th className="px-6 py-4">Final θ</th>
                    <th className="px-6 py-4">SEM</th>
                    <th className="px-6 py-4">Items Used</th>
                    <th className="px-6 py-4">Ability Level</th>
                    <th className="px-6 py-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filtered.map((s, i) => (
                    <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">{i + 1}</td>
                      <td className="px-6 py-4 font-medium text-slate-900">{s.students?.full_name ?? '—'}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{s.students?.school ?? '—'}</td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-700 bg-slate-50/50 px-3 py-1 rounded w-fit">
                        {s.final_theta != null
                          ? `${Number(s.final_theta) >= 0 ? '+' : ''}${Number(s.final_theta).toFixed(2)}`
                          : '—'}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-700">
                        {s.final_sem != null ? Number(s.final_sem).toFixed(3) : '—'}
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-slate-900">{s.total_items_administered}</td>
                      <td className="px-6 py-4"><AbilityBadge level={s.ability_level} /></td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {new Date(s.created_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
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
