/**
 * AdminDataContext
 * ─────────────────
 * Single source of truth for all admin data.
 * Wrap your admin layout with <AdminDataProvider> so every admin page
 * (Dashboard, Students, Items…) shares the same data and mutations.
 *
 * When a student is deleted on the Students page, the Dashboard instantly
 * reflects it — no refetch, no stale count.
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import {
  getAllStudents,
  getAllSessions,
  getAllItems,
  getEfficiencyStats,
  deleteStudent as apiDeleteStudent,
  deleteAllStudents as apiDeleteAllStudents,
} from '@/lib/api'
import type { Student, TestSession, Item } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────
interface AdminData {
  students:   Student[]
  sessions:   TestSession[]
  items:      Item[]
  stats:      Awaited<ReturnType<typeof getEfficiencyStats>>
  loading:    boolean
  error:      string | null

  // Mutations — call these instead of the raw API
  deleteStudent:    (id: string) => Promise<{ error?: string }>
  deleteAllStudents: ()          => Promise<{ error?: string }>
  refresh:          ()           => Promise<void>
}

// ─── Context ──────────────────────────────────────────────────────────────────
const AdminDataContext = createContext<AdminData | null>(null)

export function useAdminData(): AdminData {
  const ctx = useContext(AdminDataContext)
  if (!ctx) throw new Error('useAdminData must be used inside <AdminDataProvider>')
  return ctx
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AdminDataProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>([])
  const [sessions, setSessions] = useState<TestSession[]>([])
  const [items,    setItems]    = useState<Item[]>([])
  const [stats,    setStats]    = useState<Awaited<ReturnType<typeof getEfficiencyStats>>>(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState<string | null>(null)

  // ── Load everything once ───────────────────────────────────────────────────
  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [s, st, it, eff] = await Promise.all([
        getAllSessions(),
        getAllStudents(),
        getAllItems(),
        getEfficiencyStats(),
      ])
      setSessions(s as unknown as TestSession[])
      setStudents(st)
      setItems(it)
      setStats(eff)
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  // ── Delete single student ─────────────────────────────────────────────────
  // Optimistically removes from local state first, then calls API.
  // If API fails, rolls back.
  const deleteStudent = useCallback(async (id: string): Promise<{ error?: string }> => {
    // Optimistic update
    const prev = students
    setStudents(s => s.filter(st => st.id !== id))

    const { error } = await apiDeleteStudent(id)
    if (error) {
      setStudents(prev) // rollback
      return { error }
    }

    // Also remove their sessions from local state
    setSessions(s => s.filter((se: any) => se.student_id !== id))
    return {}
  }, [students])

  // ── Delete all students ───────────────────────────────────────────────────
  const deleteAllStudents = useCallback(async (): Promise<{ error?: string }> => {
    const prevStudents = students
    const prevSessions = sessions
    setStudents([])
    setSessions([])

    const { error } = await apiDeleteAllStudents()
    if (error) {
      setStudents(prevStudents) // rollback
      setSessions(prevSessions)
      return { error }
    }
    return {}
  }, [students, sessions])

  return (
    <AdminDataContext.Provider value={{
      students,
      sessions,
      items,
      stats,
      loading,
      error,
      deleteStudent,
      deleteAllStudents,
      refresh,
    }}>
      {children}
    </AdminDataContext.Provider>
  )
}