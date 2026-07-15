import { useState, useEffect } from 'react'
import { AdminSidebar } from '@/components/AdminSidebar'
import { useAdminData } from '@/context/Admindatacontext'
import { Search, Trash2, Users, AlertTriangle, X, GraduationCap } from 'lucide-react'

// ─── Confirm Modal ─────────────────────────────────────────────────────────────
function ConfirmModal({
  title, message, confirmLabel, onConfirm, onCancel, loading,
}: {
  title: string; message: string; confirmLabel: string
  onConfirm: () => void; onCancel: () => void; loading: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={!loading ? onCancel : undefined} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-red-500 to-rose-500" />
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-50 border border-red-100">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <h2 className="text-base font-semibold text-slate-900">{title}</h2>
            </div>
            {!loading && (
              <button onClick={onCancel} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-sm text-slate-600 leading-relaxed mb-6">{message}</p>
          <div className="flex gap-3">
            <button onClick={onCancel} disabled={loading}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50">
              Cancel
            </button>
            <button onClick={onConfirm} disabled={loading}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Deleting…
                </>
              ) : (
                <><Trash2 className="w-4 h-4" />{confirmLabel}</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium ${
      type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
    }`}>
      {type === 'success' ? '✓' : '✕'} {message}
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminStudentsPage() {
  // ✅ Uses shared context — mutations here instantly update Dashboard too
  const { students, loading, deleteStudent, deleteAllStudents } = useAdminData()

  const [search,  setSearch]  = useState('')
  const [toast,   setToast]   = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [modal,   setModal]   = useState<{
    open: boolean; mode: 'single' | 'all'
    studentId?: string; studentName?: string; working: boolean
  }>({ open: false, mode: 'single', working: false })

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3500)
    return () => clearTimeout(t)
  }, [toast])

  const filtered = students.filter(s =>
    s.full_name.toLowerCase().includes(search.toLowerCase()) ||
    s.school.toLowerCase().includes(search.toLowerCase()) ||
    s.username.toLowerCase().includes(search.toLowerCase()),
  )

  const openDeleteOne = (id: string, name: string) =>
    setModal({ open: true, mode: 'single', studentId: id, studentName: name, working: false })

  const openDeleteAll = () =>
    setModal({ open: true, mode: 'all', working: false })

  const closeModal = () =>
    setModal(m => ({ ...m, open: false, working: false }))

  const confirmDeleteOne = async () => {
    if (!modal.studentId) return
    setModal(m => ({ ...m, working: true }))
    const { error } = await deleteStudent(modal.studentId)
    setModal(m => ({ ...m, working: false, open: false }))
    setToast(error
      ? { message: `Failed: ${error}`, type: 'error' }
      : { message: `${modal.studentName} deleted successfully.`, type: 'success' }
    )
  }

  const confirmDeleteAll = async () => {
    setModal(m => ({ ...m, working: true }))
    const { error } = await deleteAllStudents()
    setModal(m => ({ ...m, working: false, open: false }))
    setToast(error
      ? { message: `Failed: ${error}`, type: 'error' }
      : { message: 'All student records deleted.', type: 'success' }
    )
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />

      <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <div className="p-2.5 bg-blue-600 rounded-xl shadow-sm shadow-blue-200">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Student Records</h1>
            </div>
            <p className="text-sm text-slate-500 ml-[52px]">
              {loading ? 'Loading…' : `${students.length} registered student${students.length !== 1 ? 's' : ''}`}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {!loading && (
              <>
                <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-center shadow-sm">
                  <p className="text-xl font-bold text-slate-900">{students.filter(s => s.gender === 'Male').length}</p>
                  <p className="text-[10px] text-blue-600 font-semibold uppercase tracking-wider">Male</p>
                </div>
                <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-center shadow-sm">
                  <p className="text-xl font-bold text-slate-900">{students.filter(s => s.gender === 'Female').length}</p>
                  <p className="text-[10px] text-pink-500 font-semibold uppercase tracking-wider">Female</p>
                </div>
                <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-center shadow-sm">
                  <p className="text-xl font-bold text-slate-900">{new Set(students.map(s => s.school)).size}</p>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Schools</p>
                </div>
              </>
            )}
            <button
              onClick={openDeleteAll}
              disabled={loading || students.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold shadow-sm shadow-red-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4" />
              Delete All
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-5 relative">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            className="w-full pl-11 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm"
            placeholder="Search by name, username, or school…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-3">
              {[1,2,3,4,5].map(i => <div key={i} className="h-14 bg-slate-50 animate-pulse rounded-xl" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Users className="w-10 h-10 mb-3 opacity-40" />
              <p className="text-sm font-medium">
                {search ? 'No students match your search.' : 'No students registered yet.'}
              </p>
              {search && (
                <button onClick={() => setSearch('')} className="mt-2 text-xs text-blue-500 hover:underline">
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60">
                    {['#','Student','Username','Gender','School','Type','Class','Registered',''].map(h => (
                      <th key={h} className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s, i) => (
                    <tr key={s.id} className="border-b border-slate-50 hover:bg-blue-50/30 transition-colors group">
                      <td className="px-5 py-4 text-xs text-slate-400 font-mono tabular-nums">{i + 1}</td>
                      <td className="px-5 py-4 font-semibold text-sm text-slate-900">{s.full_name}</td>
                      <td className="px-5 py-4 font-mono text-xs text-slate-500">{s.username}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          s.gender === 'Male' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'
                        }`}>{s.gender}</span>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-600 max-w-[160px] truncate">{s.school}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          s.school_type === 'Public' ? 'bg-amber-50 text-amber-700' : 'bg-violet-50 text-violet-700'
                        }`}>{s.school_type}</span>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-600">{s.class}</td>
                      <td className="px-5 py-4 text-xs text-slate-400 whitespace-nowrap">
                        {new Date(s.created_at).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })}
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => openDeleteOne(s.id, s.full_name)}
                          className="opacity-0 group-hover:opacity-100 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/40 flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  Showing <span className="font-semibold text-slate-600">{filtered.length}</span> of{' '}
                  <span className="font-semibold text-slate-600">{students.length}</span> students
                </p>
                {search && filtered.length !== students.length && (
                  <button onClick={() => setSearch('')} className="text-xs text-blue-500 hover:underline">Show all</button>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {modal.open && (
        <ConfirmModal
          title={modal.mode === 'all' ? 'Delete all students?' : 'Delete student?'}
          message={modal.mode === 'all'
            ? `This will permanently delete all ${students.length} student records and their test data. This cannot be undone.`
            : `This will permanently delete ${modal.studentName} along with all their test sessions and responses. This cannot be undone.`
          }
          confirmLabel={modal.mode === 'all' ? 'Delete all' : 'Delete student'}
          onConfirm={modal.mode === 'all' ? confirmDeleteAll : confirmDeleteOne}
          onCancel={closeModal}
          loading={modal.working}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}