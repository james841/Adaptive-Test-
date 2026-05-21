import { useEffect, useState } from 'react'
import { AdminSidebar } from '@/components/AdminSidebar'
import { SectionHeader, EmptyState, AbilityBadge } from '@/components/ui'
import { getAllSessions } from '@/lib/api'
import { BarChart3, Filter, FileSpreadsheet, FileText } from 'lucide-react'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDuration(start: string, end: string): string {
  if (!start || !end) return '—'
  const ms = new Date(end).getTime() - new Date(start).getTime()
  if (ms <= 0) return '—'
  const totalSec = Math.round(ms / 1000)
  const mins     = Math.floor(totalSec / 60)
  const secs     = totalSec % 60
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
}

function fmtTheta(val: any): string {
  if (val == null) return '—'
  const n = Number(val)
  return `${n >= 0 ? '+' : ''}${n.toFixed(2)}`
}

// ─── PDF Export ───────────────────────────────────────────────────────────────

function exportPDF(data: any[], filter: string) {
  const rows = data.map((s, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${s.students?.full_name ?? '—'}</td>
      <td>${s.students?.school ?? '—'}</td>
      <td>${fmtTheta(s.final_theta)}</td>
      <td>${s.final_sem != null ? Number(s.final_sem).toFixed(3) : '—'}</td>
      <td>${s.total_items_administered}</td>
      <td>${fmtDuration(s.start_time, s.end_time)}</td>
      <td>${s.ability_level ?? '—'}</td>
      <td>${new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
    </tr>
  `).join('')

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8"/>
      <title>CAT Results — ${filter}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', sans-serif; font-size: 11px; color: #111; padding: 32px; }
        .header { margin-bottom: 24px; }
        h1  { font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
        p.meta { font-size: 10px; color: #64748b; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #1e293b; color: #fff; text-align: left;
             padding: 9px 12px; font-size: 9px; text-transform: uppercase; letter-spacing: 1px; }
        td { padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-size: 11px; }
        tr:nth-child(even) td { background: #f8fafc; }
        .low     { color: #dc2626; font-weight: 600; }
        .average { color: #d97706; font-weight: 600; }
        .high    { color: #16a34a; font-weight: 600; }
        @media print { body { padding: 16px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>CAT System — Test Results</h1>
        <p class="meta">
          Filter: ${filter} &nbsp;|&nbsp; Total: ${data.length} records &nbsp;|&nbsp;
          Generated: ${new Date().toLocaleString()}
        </p>
      </div>
      <table>
        <thead>
          <tr>
            <th>#</th><th>Student Name</th><th>School</th>
            <th>Final θ</th><th>SEM</th><th>Items</th>
            <th>Time Taken</th><th>Ability Level</th><th>Date</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </body>
    </html>
  `

  const win = window.open('', '_blank')
  if (!win) { alert('Please allow popups to download PDF'); return }
  win.document.write(html)
  win.document.close()
  win.focus()
  setTimeout(() => { win.print(); win.close() }, 500)
}

// ─── Excel Export ─────────────────────────────────────────────────────────────

function exportExcel(data: any[], filter: string) {
  const headers = [
    '#', 'Student Name', 'School', 'Final Theta (θ)',
    'SEM', 'Items Used', 'Time Taken', 'Ability Level', 'Date',
  ]

  const rows = data.map((s, i) => [
    i + 1,
    s.students?.full_name ?? '',
    s.students?.school ?? '',
    fmtTheta(s.final_theta),
    s.final_sem != null ? Number(s.final_sem).toFixed(3) : '',
    s.total_items_administered,
    fmtDuration(s.start_time, s.end_time),
    s.ability_level ?? '',
    new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  ])

  const escape = (v: any) => {
    const str = String(v ?? '')
    return str.includes(',') || str.includes('"') || str.includes('\n')
      ? `"${str.replace(/"/g, '""')}"`
      : str
  }

  const csvContent = [
    `CAT System — Results Export`,
    `Filter: ${filter} | Total: ${data.length} | Generated: ${new Date().toLocaleString()}`,
    '',
    headers.map(escape).join(','),
    ...rows.map(row => row.map(escape).join(',')),
  ].join('\n')

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href     = url
  link.download = `cat-results-${filter.toLowerCase()}-${Date.now()}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

// ─── Page ─────────────────────────────────────────────────────────────────────

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

        {/* Filter + Export row */}
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          {/* Filter buttons */}
          <div className="flex items-center gap-2 flex-wrap">
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

          {/* Export buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportExcel(filtered, filter)}
              disabled={loading || filtered.length === 0}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
                         bg-white border border-slate-200 text-slate-700
                         hover:border-green-400 hover:text-green-700 hover:bg-green-50
                         disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Export Excel
            </button>
            <button
              onClick={() => exportPDF(filtered, filter)}
              disabled={loading || filtered.length === 0}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
                         bg-slate-900 text-white
                         hover:bg-slate-700
                         disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <FileText className="w-4 h-4" />
              Export PDF
            </button>
          </div>
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
            <EmptyState message={filter !== 'All' ? `No ${filter} ability results found.` : 'No test results found.'} />
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
                    <th className="px-6 py-4">Time Taken</th>
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
                      <td className="px-6 py-4 font-mono text-xs text-slate-700">
                        {fmtTheta(s.final_theta)}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-700">
                        {s.final_sem != null ? Number(s.final_sem).toFixed(3) : '—'}
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-slate-900">
                        {s.total_items_administered}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-600">
                        {fmtDuration(s.start_time, s.end_time)}
                      </td>
                      <td className="px-6 py-4">
                        <AbilityBadge level={s.ability_level} />
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {new Date(s.created_at).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
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