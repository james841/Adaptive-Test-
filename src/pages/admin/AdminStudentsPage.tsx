import { useEffect, useState } from 'react'
import { AdminSidebar } from '@/components/AdminSidebar'
import { SectionHeader, EmptyState } from '@/components/ui'
import { getAllStudents } from '@/lib/api'
import type { Student } from '@/types'

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
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <SectionHeader
          title="STUDENTS"
          subtitle={`${students.length} registered students`}
          action={
            <input
              className="input-field w-56 text-sm"
              placeholder="Search by name or school…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          }
        />

        {loading ? (
          <p className="text-sm text-steel">Loading…</p>
        ) : filtered.length === 0 ? (
          <EmptyState message="No students found." />
        ) : (
          <div className="border border-mist overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Full Name</th>
                  <th>Username</th>
                  <th>Gender</th>
                  <th>School</th>
                  <th>Class</th>
                  <th>Registered</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr key={s.id}>
                    <td className="font-mono text-xs text-steel">{i + 1}</td>
                    <td className="font-medium">{s.full_name}</td>
                    <td className="font-mono text-xs">{s.username}</td>
                    <td className="text-sm">{s.gender}</td>
                    <td className="text-xs text-steel">{s.school}</td>
                    <td className="text-xs">{s.class}</td>
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
