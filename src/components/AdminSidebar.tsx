import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutGrid, BookOpen, Users, BarChart3, TrendingUp, LogOut, Menu, X } from 'lucide-react'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { useState } from 'react'

const links = [
  { to: '/admin/dashboard',  label: 'Dashboard',   icon: LayoutGrid },
  { to: '/admin/items',      label: 'Item Bank',   icon: BookOpen },
  { to: '/admin/students',   label: 'Students',    icon: Users },
  { to: '/admin/results',    label: 'Results',     icon: BarChart3 },
  { to: '/admin/efficiency', label: 'Efficiency',  icon: TrendingUp },
]

export function AdminSidebar() {
  const { adminEmail, logout } = useAdminAuth()
  const navigate = useNavigate()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login')
  }

  return (
    <aside className={`min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col sticky top-0 border-r border-slate-700/50 shadow-xl transition-all duration-300 ${
      isCollapsed ? 'w-20' : 'w-64'
    }`}>
      {/* Header with Toggle */}
      <div className="px-4 py-6 border-b border-slate-700/50 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex-1 pr-2">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-blue-600 text-white font-mono text-xs px-2.5 py-1.5 font-bold tracking-wider rounded-md">
                CAT
              </div>
              <span className="font-bold text-base tracking-wider text-white">SYSTEM</span>
            </div>
            <p className="text-xs text-slate-400 mt-2 font-mono">Research Admin</p>
          </div>
        )}
        <button
          onClick={handleToggle}
          className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors flex-shrink-0"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-2 py-6 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            title={isCollapsed ? label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 justify-center lg:justify-start ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/50'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`
            }
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="hidden lg:inline">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Divider */}
      <div className="h-px bg-slate-700/50" />

      {/* Footer */}
      <div className="px-2 py-5 border-t border-slate-700/50">
        {!isCollapsed && adminEmail && (
          <p className="text-xs text-slate-400 font-mono mb-3 truncate block px-3">{adminEmail}</p>
        )}
        <button
          onClick={handleLogout}
          title="Sign out"
          className="flex items-center gap-2 w-full text-xs text-slate-300 hover:text-white transition-colors font-medium px-3 py-2 hover:bg-slate-700/30 rounded-md justify-center lg:justify-start"
        >
          <LogOut className="w-4 h-4" />
          {!isCollapsed && <span className="hidden lg:inline">Sign out</span>}
        </button>
      </div>
    </aside>
  )
}
