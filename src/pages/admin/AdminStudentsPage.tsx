import { useEffect, useState } from 'react'
import { AdminSidebar } from '@/components/AdminSidebar'
import { SectionHeader, EmptyState } from '@/components/ui'
import { getAllStudents } from '@/lib/api'
import type { Student } from '@/types'
import { Search, Users } from 'lucide-react'

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [search,   setSearch]   = useState('')
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    getAllStudents().then(data => { setStudents(data); setLoading(false) })
  }, [])

  const filtered = students.filter(s =>
    s.full_name.toLowerCase().includes(search.toLowerCase()) ||
    s.school.toLowerCase().includes(search.toLowerCase()) ||
    s.username.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <AdminSidebar />
      <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900">Students</h1>
            </div>
            <p className="text-slate-600">Manage and monitor all registered students</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-slate-900">{students.length}</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Total Registered</p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6 relative">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm"
            placeholder="Search by name, username, or school…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
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
            <EmptyState message={search ? "No students match your search." : "No students found."} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200 text-[11px] uppercase tracking-widest text-slate-500 font-semibold">
                    <th className="px-6 py-4">#</th>
                    <th className="px-6 py-4">Full Name</th>
                    <th className="px-6 py-4">Username</th>
                    <th className="px-6 py-4">Gender</th>
                    <th className="px-6 py-4">School</th>
                    <th className="px-6 py-4">Class</th>
                    <th className="px-6 py-4">Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filtered.map((s, i) => (
                    <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">{i + 1}</td>
                      <td className="px-6 py-4 font-medium text-slate-900">{s.full_name}</td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-600">{s.username}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{s.gender}</td>
                      <td className="px-6 py-4 text-xs text-slate-600">{s.school}</td>
                      <td className="px-6 py-4 text-xs text-slate-600">{s.class}</td>
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
