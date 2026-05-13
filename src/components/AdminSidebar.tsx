import { NavLink, useNavigate } from 'react-router-dom'
import { Logo } from '@/components/ui'
import { useAdminAuth } from '@/context/AdminAuthContext'

const links = [
  { to: '/admin/dashboard',  label: 'Dashboard'  },
  { to: '/admin/items',      label: 'Item Bank'   },
  { to: '/admin/students',   label: 'Students'    },
  { to: '/admin/results',    label: 'Results'     },
  { to: '/admin/efficiency', label: 'Efficiency'  },
]

export function AdminSidebar() {
  const { adminEmail, logout } = useAdminAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login')
  }

  return (
    <aside className="w-56 min-h-screen bg-ink text-chalk flex flex-col sticky top-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-ash">
        <Logo size="sm" />
        <p className="text-xs text-chalk/40 mt-1 font-mono">Admin Panel</p>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {links.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `block px-3 py-2.5 text-sm font-body transition-all duration-150 ${
                isActive
                  ? 'bg-chalk text-ink font-medium'
                  : 'text-chalk/60 hover:text-chalk hover:bg-ash'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-ash">
        {adminEmail && (
          <p className="text-xs text-chalk/40 font-mono mb-3 truncate">{adminEmail}</p>
        )}
        <button
          onClick={handleLogout}
          className="text-xs text-chalk/50 hover:text-chalk transition-colors font-body"
        >
          Sign out →
        </button>
      </div>
    </aside>
  )
}
