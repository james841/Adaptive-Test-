import { useEffect, useState } from 'react'
import { AdminSidebar } from '@/components/AdminSidebar'
import { EmptyState, AbilityBadge } from '@/components/ui'
import { getAllSessions } from '@/lib/api'
import { BarChart3, Filter, FileSpreadsheet, FileText, Download } from 'lucide-react'

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

function fmtTif(sem: any): string {
  if (sem == null) return '—'
  const n = Number(sem)
  if (n <= 0) return '—'
  return (1 / (n * n)).toFixed(2)
}

// ─── PDF Export ───────────────────────────────────────────────────────────────

function exportPDF(data: any[], filter: string) {
  const rows = data.map((s, i) => `
    <tr>
      <td>${i + 1}</td>
      <td style="font-weight: 500;">${s.students?.full_name ?? '—'}</td>
      <td>${s.students?.gender ?? '—'}</td>
      <td>${s.students?.school_type ?? '—'}</td>
      <td>${s.students?.school ?? '—'}</td>
      <td style="font-family: monospace;">${fmtTheta(s.final_theta)}</td>
      <td style="font-family: monospace;">${s.final_sem != null ? Number(s.final_sem).toFixed(3) : '—'}</td>
      <td style="font-family: monospace;">${fmtTif(s.final_sem)}</td>
      <td style="text-align: center;">${s.total_items_administered}</td>
      <td style="font-family: monospace;">${fmtDuration(s.start_time, s.end_time)}</td>
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
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; color: #334155; padding: 40px; background: #fff; }
        .header { margin-bottom: 32px; border-bottom: 1px solid #e2e8f0; padding-bottom: 16px; }
        h1  { font-size: 22px; font-weight: 700; color: #0f172a; margin-bottom: 6px; letter-spacing: -0.02em; }
        p.meta { font-size: 12px; color: #64748b; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th { background: #f8fafc; color: #475569; text-align: left; font-weight: 600;
             padding: 12px 14px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #e2e8f0; }
        td { padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-size: 11px; color: #334155; }
        tr:nth-child(even) td { background: #f8fafc/50; }
        @media print { body { padding: 20px; } .header { margin-bottom: 24px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Adaptive Testing System — Results Report</h1>
        <p class="meta">
          <strong>Filter Status:</strong> ${filter} &nbsp;·&nbsp; <strong>Total Records:</strong> ${data.length} &nbsp;·&nbsp;
          <strong>Generated:</strong> ${new Date().toLocaleString()}
        </p>
      </div>
      <table>
        <thead>
          <tr>
            <th>#</th><th>Student Name</th><th>Gender</th><th>School Type</th><th>School</th>
            <th>Final θ</th><th>SEM</th><th>TIF</th><th style="text-align: center;">Items</th>
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
    '#', 'Student Name', 'Gender', 'School Type', 'School', 'Final Theta (θ)',
    'SEM', 'TIF', 'Items Used', 'Time Taken', 'Ability Level', 'Date',
  ]

  const rows = data.map((s, i) => [
    i + 1,
    s.students?.full_name ?? '',
    s.students?.gender ?? '',
    s.students?.school_type ?? '',
    s.students?.school ?? '',
    fmtTheta(s.final_theta),
    s.final_sem != null ? Number(s.final_sem).toFixed(3) : '',
    fmtTif(s.final_sem),
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
    <div className="flex min-h-screen bg-slate-50 text-slate-900 antialiased">
      <AdminSidebar />
      <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">

        {/* Dashboard Header Container */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 shrink-0">
              <BarChart3 className="w-6 h-6 text-slate-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Test Results</h1>
              <p className="text-sm text-slate-500 mt-0.5">Review metric evaluation datasets across all completed adaptive sessions</p>
            </div>
          </div>
          
          <div className="sm:text-right bg-slate-50 px-5 py-3 rounded-xl border border-slate-100 min-w-[140px]">
            <p className="text-3xl font-bold font-mono tracking-tight text-slate-900">{sessions.length}</p>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Total Records</p>
          </div>
        </div>

        {/* Filters and Utilities Control Panel */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          
          {/* Segmented Filter Control */}
          <div className="flex items-center gap-3 bg-white border border-slate-200 p-1.5 rounded-xl w-fit">
            <div className="flex items-center gap-1.5 px-2 text-slate-400">
              <Filter className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider hidden sm:inline">Ability:</span>
            </div>
            <div className="flex items-center gap-1">
              {(['All', 'Low', 'Average', 'High'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-all ${
                    filter === f
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Export Action Triggers */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportExcel(filtered, filter)}
              disabled={loading || filtered.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl
                         bg-white border border-slate-200 text-slate-700 hover:bg-slate-50
                         disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-slate-500" />
              <span>Export CSV</span>
            </button>
            
            <button
              onClick={() => exportPDF(filtered, filter)}
              disabled={loading || filtered.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl
                         bg-slate-900 text-white hover:bg-slate-800
                         disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <FileText className="w-4 h-4 text-slate-300" />
              <span>Print Report</span>
            </button>
          </div>
        </div>

        {/* Master Table Frame */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-11 bg-slate-100/70 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState message={filter !== 'All' ? `No ${filter} ability results found.` : 'No test results found.'} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                    <th className="px-5 py-3.5 font-medium w-12 text-center">#</th>
                    <th className="px-5 py-3.5 font-medium">Student Name</th>
                    <th className="px-5 py-3.5 font-medium">Gender</th>
                    <th className="px-5 py-3.5 font-medium">School Type</th>
                    <th className="px-5 py-3.5 font-medium">School</th>
                    <th className="px-5 py-3.5 font-medium">Final θ</th>
                    <th className="px-5 py-3.5 font-medium">SEM</th>
                    <th className="px-5 py-3.5 font-medium">TIF</th>
                    <th className="px-5 py-3.5 font-medium text-center">Items</th>
                    <th className="px-5 py-3.5 font-medium">Duration</th>
                    <th className="px-5 py-3.5 font-medium">Ability Level</th>
                    <th className="px-5 py-3.5 font-medium">Date Completed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filtered.map((s, i) => (
                    <tr key={s.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-xs text-slate-400 text-center">{i + 1}</td>
                      <td className="px-5 py-3.5 font-medium text-slate-900 whitespace-nowrap">{s.students?.full_name ?? '—'}</td>
                      <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">{s.students?.gender ?? '—'}</td>
                      <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">{s.students?.school_type ?? '—'}</td>
                      <td className="px-5 py-3.5 text-slate-500 max-w-xs truncate">{s.students?.school ?? '—'}</td>
                      <td className="px-5 py-3.5 font-mono text-xs text-slate-600 whitespace-nowrap">{fmtTheta(s.final_theta)}</td>
                      <td className="px-5 py-3.5 font-mono text-xs text-slate-600 whitespace-nowrap">
                        {s.final_sem != null ? Number(s.final_sem).toFixed(3) : '—'}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs text-slate-600 whitespace-nowrap">{fmtTif(s.final_sem)}</td>
                      <td className="px-5 py-3.5 text-center font-medium text-slate-800 whitespace-nowrap">
                        {s.total_items_administered}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs text-slate-500 whitespace-nowrap">
                        {fmtDuration(s.start_time, s.end_time)}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <AbilityBadge level={s.ability_level} />
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-400 whitespace-nowrap">
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