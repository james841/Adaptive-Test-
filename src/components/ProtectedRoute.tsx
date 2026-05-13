import { Navigate } from 'react-router-dom'
import { useStudentAuth } from '@/context/StudentAuthContext'
import { useAdminAuth }   from '@/context/AdminAuthContext'
import { PageLoader }     from '@/components/ui'

export function StudentRoute({ children }: { children: React.ReactNode }) {
  const { student, isLoading } = useStudentAuth()
  if (isLoading) return <PageLoader />
  if (!student)  return <Navigate to="/login" replace />
  return <>{children}</>
}

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, isLoading } = useAdminAuth()

  console.log('[AdminRoute] isLoading:', isLoading, '| isAdmin:', isAdmin)

  // Safety timeout — if loading takes more than 5s, force it through
  if (isLoading) return <PageLoader />
  if (!isAdmin)  return <Navigate to="/admin/login" replace />
  return <>{children}</>
}
