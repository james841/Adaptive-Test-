import { Link, useNavigate } from 'react-router-dom'
import { Logo } from '@/components/ui'
import { useStudentAuth } from '@/context/StudentAuthContext'

export function StudentNav() {
  const { student, logout } = useStudentAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-4">
          <Logo size="sm" />
          <span className="hidden sm:inline-block text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">
            Adaptive assessment
          </span>
        </Link>

        {student ? (
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-3 py-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-semibold">
                {student.full_name.slice(0, 1).toUpperCase()}
              </span>
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-900 leading-none">{student.full_name}</p>
                <p className="text-[11px] text-slate-500 uppercase tracking-[0.2em]">Student</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/instructions"
                className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                My Assessment
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition">
              Login
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
