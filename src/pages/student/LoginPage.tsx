import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { StudentNav } from '@/components/StudentNav'
import { PageShell, ErrorMsg } from '@/components/ui'
import { useStudentAuth } from '@/context/StudentAuthContext'
import { loginStudent } from '@/lib/api'
import { User, Lock, Loader2, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const { setStudent } = useStudentAuth()
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { student, error: err } = await loginStudent(
      username.trim().toLowerCase(),
      password,
    )
    setLoading(false)

    if (err) return setError(err)
    setStudent(student!)
    navigate('/instructions')
  }

  return (
    <PageShell>
      <StudentNav />
      <main className="flex-1 flex items-center justify-center py-12 px-4 bg-slate-50/30">
        <div className="w-full max-w-md animate-fade-up">
          
          {/* Card Container */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 p-8 md:p-10">
            <div className="mb-8 text-center md:text-left">
              <p className="text-xs font-bold tracking-[0.2em] text-blue-600 uppercase mb-2">Student Access</p>
              <h1 className="font-display text-4xl text-slate-900">Sign In</h1>
              <p className="text-slate-500 mt-2">Enter your details to continue your assessment.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 ml-1">Username</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm font-mono placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                    placeholder="e.g. jdoe24"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-xs font-semibold text-slate-700">Password</label>
                  <button type="button" className="text-[10px] text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-wider font-bold">
                    Forgot?
                  </button>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="current-password"
                  />
                </div>
              </div>

              {error && (
                <div className="animate-shake">
                  <ErrorMsg message={error} />
                </div>
              )}

              <button 
                type="submit" 
                className="group relative w-full bg-slate-900 text-white rounded-xl py-3.5 font-bold text-sm transition-all hover:bg-blue-600 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden" 
                disabled={loading}
              >
                <div className="flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span>Enter Assessment</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </div>
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <p className="text-center text-sm text-slate-500">
                New to the platform?{' '}
                <Link to="/register" className="text-blue-600 font-semibold hover:underline underline-offset-4">
                  Create an account
                </Link>
              </p>
            </div>
          </div>

          {/* Helper Note */}
          <p className="text-center mt-8 text-xs text-slate-400 px-6">
            Authorized student access only. Your IP and session details are logged for academic integrity.
          </p>
        </div>
      </main>
    </PageShell>
  )
}