import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useStudentAuth } from '@/context/StudentAuthContext'
import { Menu, X, LogOut, User, ShieldAlert, Award } from 'lucide-react'

export function StudentNav() {
  const { student, logout } = useStudentAuth()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Assessment Map', href: '/instructions' },
    { name: 'Performance Metrics', href: '/results' },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Logo Brand Branding */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center text-white font-semibold text-sm shadow-sm transition-transform group-hover:scale-105">
                ∑
              </div>
              <span className="font-sans font-bold tracking-tight text-slate-900 text-sm sm:text-base">
                Universal<span className="text-blue-600 font-medium">CAT</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center gap-1">
            {student && navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'text-blue-600 bg-blue-50/50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop Right Hand Utility Profile Actions */}
          <div className="hidden md:flex items-center gap-3">
            {student ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-slate-50 border border-slate-200">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="w-3 h-3 text-blue-600" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 max-w-[120px] truncate">
                    {(student as any).email?.split('@')[0] || 'Candidate'}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-2"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold tracking-wide shadow-sm transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburguer Toggle Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 focus:outline-none transition-colors"
              aria-expanded="false"
            >
              <span className="sr-only">Open system menu</span>
              {isOpen ? <X className="block h-5 w-5" /> : <Menu className="block h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Panel Stack */}
      <div className={`md:hidden transition-all duration-200 ease-in-out ${isOpen ? 'block border-b border-slate-200 bg-white' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {student ? (
            <>
              <div className="px-3 py-2 mb-2 rounded-md bg-slate-50 border border-slate-200 flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold text-slate-800 truncate">{(student as any).name || (student as any).email?.split('@')[0] || 'Candidate'}</p>
                  <p className="text-[10px] text-slate-500 font-mono truncate">{(student as any).email || 'Session Token Active'}</p>
                </div>
              </div>
              
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${
                    isActive(item.href)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              
              <div className="pt-4 mt-2 border-t border-slate-100">
                <button
                  onClick={() => { logout(); setIsOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-base font-medium text-red-600 hover:bg-red-50/50 transition-all text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out from Session
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-2 py-2 px-1">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="block text-center w-full text-sm font-semibold text-slate-700 border border-slate-200 bg-white py-3 rounded-lg shadow-sm"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                className="block text-center w-full text-sm font-semibold text-white bg-blue-600 py-3 rounded-lg shadow-sm"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}