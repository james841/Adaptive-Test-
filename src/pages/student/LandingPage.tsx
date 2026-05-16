import { Link } from 'react-router-dom'
import { StudentNav } from '@/components/StudentNav'
import { PageShell } from '@/components/ui'
import { useStudentAuth } from '@/context/StudentAuthContext'
import { ArrowRight, BookOpen, BrainCircuit, Zap, GraduationCap, CheckCircle2 } from 'lucide-react'

export default function LandingPage() {
  const { student } = useStudentAuth()
  const primaryLink = student ? '/instructions' : '/register'

  return (
    <PageShell className="min-h-screen bg-slate-50/50 flex flex-col selection:bg-blue-500/10 selection:text-blue-600">
      <StudentNav />

      <main className="flex-1 overflow-hidden">
        {/* Hero Section */}
        <section className="relative max-w-7xl mx-auto px-6 pt-16 pb-24 md:pt-32 md:pb-40">
          {/* Subtle Dynamic Background Grid / Pattern */}
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-60" />
          <div className="absolute top-10 right-10 -z-10 opacity-[0.04] select-none pointer-events-none hidden lg:block">
            <h1 className="text-[24rem] font-display font-black leading-none tracking-tighter">
              ∑ ∫ √
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="animate-fade-up lg:col-span-7 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50/80 border border-blue-100 text-blue-700 text-xs font-semibold tracking-wide uppercase mb-6 backdrop-blur-sm">
                <Zap className="w-3.5 h-3.5 text-blue-600" />
                Rasch-Based Adaptive Testing
              </div>
              
              <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-slate-950 leading-[0.95] mb-6">
                STUDENTS<br />
                <span className="bg-gradient-to-r bg-clip-text text-transparent from-blue-600 to-indigo-600">ASSESSMENT</span>
              </h1>
              
              <p className="text-slate-600 text-lg md:text-xl max-w-xl leading-relaxed mb-10">
                An intelligent system that adjusts to your ability in real-time. 
                Get questions tailored to your skill level with high-precision testing built for 
                <span className="text-slate-900 font-semibold"> JSS2 Students.</span>
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to={primaryLink} 
                  className="group flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-xl font-semibold shadow-md shadow-slate-900/10 transition-all duration-200 hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.98]"
                >
                  {student ? 'Continue Assessment' : 'Start My Assessment'}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
                <Link 
                  to="/login" 
                  className="flex items-center justify-center px-8 py-4 rounded-xl font-semibold text-slate-700 border border-slate-200 bg-white shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 active:scale-[0.98]"
                >
                  Already registered
                </Link>
              </div>
            </div>

            {/* Decorative Floating Preview Widget */}
            <div className="hidden lg:block lg:col-span-5 relative animate-fade-up [animation-delay:200ms]">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-3xl blur-3xl opacity-10" />
              <div className="relative bg-white border border-slate-200/80 p-8 rounded-2xl shadow-xl shadow-slate-200/50">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded">CAT_ENGINE_v2.0</span>
                </div>
                <div className="space-y-4">
                  <div className="h-4 bg-slate-100 rounded-md w-3/4" />
                  <div className="h-4 bg-slate-100 rounded-md w-1/2" />
                  <div className="pt-4 space-y-2">
                    <div className="h-10 border-2 border-blue-500 bg-blue-50/30 rounded-xl flex items-center px-4 text-sm font-medium text-blue-700">
                      θ Ability Parameter Calibration...
                    </div>
                    <div className="h-10 border border-slate-100 rounded-xl" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features / How it Works */}
        <section className="bg-white border-y border-slate-200 relative">
          <div className="max-w-6xl mx-auto px-6 py-24">
            <div className="mb-16 text-center md:text-left">
              <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">Process</h2>
              <p className="text-3xl md:text-4xl font-display font-bold text-slate-900 tracking-tight">How it works</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <GraduationCap className="w-5 h-5 text-blue-600" />,
                  title: 'Register & Profile',
                  body: 'Quick setup with your name and school details. Ready in seconds.',
                },
                {
                  icon: <BrainCircuit className="w-5 h-5 text-indigo-600" />,
                  title: 'Adaptive Engine',
                  body: 'The CAT engine recalibrates after every answer to find your true ability level.',
                },
                {
                  icon: <Zap className="w-5 h-5 text-amber-500" />,
                  title: 'Instant Precision',
                  body: 'Receive a detailed capability breakdown immediately upon completion.',
                },
              ].map((item, i) => (
                <div key={i} className="group relative bg-slate-50/50 p-8 rounded-2xl border border-slate-200/60 transition-all duration-300 hover:bg-white hover:border-slate-200 hover:shadow-xl hover:shadow-slate-200/40 hover:-translate-y-1">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-6 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform duration-200">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-slate-600 leading-relaxed text-sm md:text-base">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Topics Section */}
        <section className="max-w-6xl mx-auto px-6 py-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="text-center md:text-left">
              <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">Curriculum</h2>
              <p className="text-3xl md:text-4xl font-display font-bold text-slate-900 tracking-tight">Topics Covered</p>
            </div>
            <p className="text-slate-500 max-w-md text-center md:text-left text-sm md:text-base">
              Comprehensive evaluation blueprints spanning the official national curriculum guidelines for JSS2 Mathematics.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              'Algebra', 'Linear Equations', 'Fractions', 'Percentages',
              'Ratio', 'Integers', 'LCM & HCF', 'Standard Form',
            ].map(t => (
              <div key={t} className="group flex items-center gap-3 border border-slate-200/70 bg-white p-4.5 rounded-xl transition-all duration-200 hover:border-blue-300 hover:shadow-sm hover:shadow-blue-500/5">
                <CheckCircle2 className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors duration-200 shrink-0" />
                <span className="font-medium text-slate-700 group-hover:text-slate-900 transition-colors duration-200 text-sm md:text-base">{t}</span>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-600/20">∑</div>
            <span className="font-display font-bold text-white tracking-widest text-xs uppercase">CAT System</span>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 text-center sm:text-left">
            <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500">© 2026 Mathematics Research Project</p>
            <Link to="/admin/login" className="text-xs hover:text-white transition-colors sm:border-l sm:border-slate-800 sm:pl-8 py-1">
              Researcher Portal
            </Link>
          </div>
        </div>
      </footer>
    </PageShell>
  )
}