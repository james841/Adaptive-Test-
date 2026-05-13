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
    <header className="sticky top-0 z-40 bg-chalk/95 backdrop-blur-sm border-b border-mist">
      <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link to="/">
          <Logo size="sm" />
        </Link>
        {student ? (
          <div className="flex items-center gap-4">
            <span className="text-xs text-steel hidden sm:block">
              {student.full_name}
            </span>
            <button onClick={handleLogout} className="text-xs text-steel hover:text-ink transition-colors">
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link to="/login" className="nav-link text-xs">Login</Link>
            <Link to="/register" className="btn-primary py-2 px-4 text-xs">Register</Link>
          </div>
        )}
      </div>
    </header>
  )
}
