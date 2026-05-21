import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { PageShell } from '@/components/ui'
import { useAdminAuth } from '@/context/AdminAuthContext'

export default function AdminLoginPage() {
  const { isAdmin, isLoading } = useAdminAuth()
  const navigate = useNavigate()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  useEffect(() => {
    if (!isLoading && isAdmin) navigate('/admin/dashboard', { replace: true })
  }, [isAdmin, isLoading, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await supabase.auth.signInWithPassword({ email, password })
      setLoading(false)
      if (res.error) {
        console.error('Supabase signIn error', res.error)
        setError(res.error.message || 'Invalid email or password.')
        return
      }
    } catch (err: any) {
      console.error('Sign-in request failed', err)
      setLoading(false)
      setError('Network error. Please try again.')
      return
    }
    navigate('/admin/dashboard')
  }

  return (
    <PageShell className="bg-ink">
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm animate-fade-up">
          {/* Logo */}
          <div className="mb-10 flex items-center gap-2">
            <div className="bg-chalk text-ink font-mono text-xs px-2 py-1 font-bold tracking-wider">CAT</div>
            <span className="font-display text-2xl tracking-wider text-chalk">SYSTEM</span>
          </div>

          <p className="text-chalk/50 text-xs uppercase tracking-widest mb-2">Researcher / Admin</p>
          <h1 className="font-display text-4xl tracking-wide text-chalk mb-8">SIGN IN</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-widest text-chalk/40 mb-2">Email</label>
              <input
                type="email"
                className="w-full border border-ash bg-ash text-chalk px-4 py-3 font-body placeholder:text-chalk/20 focus:outline-none focus:border-chalk/50 transition-colors"
                placeholder="researcher@university.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-widest text-chalk/40 mb-2">Password</label>
              <input
                type="password"
                className="w-full border border-ash bg-ash text-chalk px-4 py-3 font-body placeholder:text-chalk/20 focus:outline-none focus:border-chalk/50 transition-colors"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <div className="border border-red-700 bg-red-900/30 px-4 py-3 text-sm text-red-400">{error}</div>
            )}
            <button
              type="submit"
              className="w-full bg-chalk text-ink font-body font-medium px-6 py-3 hover:bg-mist transition-colors disabled:opacity-40"
              disabled={loading}
            >
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>
        </div>
      </main>
    </PageShell>
  )
}
