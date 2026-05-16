import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { StudentNav } from '@/components/StudentNav'
import { PageShell, ErrorMsg } from '@/components/ui'
import { useStudentAuth } from '@/context/StudentAuthContext'
import { registerStudent } from '@/lib/api'
import { User, School, GraduationCap, Lock, ArrowRight, Loader2, Users } from 'lucide-react'

export default function RegisterPage() {
  const { student, isLoading, setStudent } = useStudentAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && student) {
      navigate('/instructions', { replace: true })
    }
  }, [student, isLoading, navigate])

  const [form, setForm] = useState({
    full_name: '', gender: '' as 'Male' | 'Female' | '',
    school: '', class: 'JSS2', username: '', password: '', confirm: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const update = (k: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.gender) return setError('Please select your gender.')
    if (form.password.length < 6) return setError('Password must be at least 6 characters.')
    if (form.password !== form.confirm) return setError('Passwords do not match.')

    setLoading(true)
    const { student, error: err } = await registerStudent({
      full_name: form.full_name,
      gender: form.gender as 'Male' | 'Female',
      school: form.school,
      class: form.class,
      username: form.username.trim().toLowerCase(),
      password: form.password,
    })
    setLoading(false)

    if (err) return setError(err)
    setStudent(student!)
    navigate('/instructions')
  }

  return (
    <PageShell>
      <StudentNav />
      <main className="flex-1 flex items-center justify-center py-12 px-4 bg-slate-50/30">
        <div className="w-full max-w-xl animate-fade-up">
          
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden">
            {/* Header Banner */}
            <div className="bg-slate-900 px-8 py-6 text-white text-center md:text-left">
              <h1 className="font-display text-3xl tracking-tight">Create Student Account</h1>
              <p className="text-slate-400 text-sm mt-1">Join the adaptive mathematics assessment platform.</p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8">
              
              {/* Section 1: Demographics */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2 text-blue-600">
                  <User className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Personal Information</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 ml-1">Full Name</label>
                    <input
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                      placeholder="Amaka Okonkwo"
                      value={form.full_name}
                      onChange={update('full_name')}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 ml-1">Gender</label>
                    <div className="relative">
                      <select
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                        value={form.gender}
                        onChange={update('gender')}
                        required
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                      <Users className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 ml-1">School Name</label>
                    <div className="relative group">
                      <School className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600" />
                      <input
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                        placeholder="Government Secondary School"
                        value={form.school}
                        onChange={update('school')}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 ml-1">Class</label>
                    <div className="relative">
                      <select 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                        value={form.class} 
                        onChange={update('class')}
                      >
                        <option value="JSS1">JSS 1</option>
                        <option value="JSS2">JSS 2</option>
                        <option value="JSS3">JSS 3</option>
                      </select>
                      <GraduationCap className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Section 2: Account Security */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2 text-blue-600">
                  <Lock className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Account Security</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 ml-1">Username</label>
                  <input
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                    placeholder="choose_a_username"
                    value={form.username}
                    onChange={update('username')}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 ml-1">Password</label>
                    <input
                      type="password"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                      placeholder="min. 6 characters"
                      value={form.password}
                      onChange={update('password')}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 ml-1">Confirm Password</label>
                    <input
                      type="password"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                      placeholder="repeat password"
                      value={form.confirm}
                      onChange={update('confirm')}
                      required
                    />
                  </div>
                </div>
              </div>

              {error && <ErrorMsg message={error} />}

              <button
                type="submit"
                className="group relative w-full bg-blue-600 text-white rounded-xl py-4 font-bold text-sm transition-all hover:bg-slate-900 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-100"
                disabled={loading}
              >
                <div className="flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Registration</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </div>
              </button>
            </form>

            <div className="bg-slate-50 px-8 py-5 border-t border-slate-100 text-center">
              <p className="text-sm text-slate-500">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 font-bold hover:underline underline-offset-4">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </PageShell>
  )
}