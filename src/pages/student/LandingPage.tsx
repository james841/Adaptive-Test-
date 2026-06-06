import { Link } from 'react-router-dom'
import { StudentNav } from '@/components/StudentNav'
import { PageShell } from '@/components/ui'
import { useStudentAuth } from '@/context/StudentAuthContext'
import { ArrowRight, BookOpen, BrainCircuit, Zap, GraduationCap, CheckCircle2, Monitor } from 'lucide-react'

export default function LandingPage() {
  const { student } = useStudentAuth()
  const primaryLink = student ? '/instructions' : '/register'

  return (
    <PageShell className="min-h-screen bg-slate-50 flex flex-col antialiased selection:bg-blue-600/10 selection:text-blue-700">
      <StudentNav />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative border-b border-slate-200/60 bg-white overflow-hidden">
          {/* Subtle Structural Background Pattern */}
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:3.5rem_3.5rem]" />
          
          <div className="max-w-7xl mx-auto px-6 pt-24 pb-28 md:pt-32 md:pb-36">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
              
              {/* Left Column: Context & Copy */}
              <div className="lg:col-span-7 space-y-8">
                {/* Micro Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold tracking-wide">
                  <Zap className="w-3.5 h-3.5 fill-blue-700 text-blue-700" />
                  Rasch-Based Adaptive Testing Engine
                </div>
                
                {/* Refined Premium Headings */}
                <div className="space-y-4">
                  <h1 className="font-sans text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
                    Adaptive Evaluation for <br />
                    <span className="text-blue-600">Junior Secondary Students</span>
                  </h1>
                  
                  <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-xl">
                    An intelligent assessment environment that calibrated dynamically to a student's real-time capability metrics. High-precision benchmarking configured specifically for the <span className="text-slate-900 font-semibold">JSS2 Mathematics curriculum</span>.
                  </p>
                </div>

                {/* Primary Actions Matrix */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                  <Link 
                    to={primaryLink} 
                    className="group flex items-center justify-center gap-2 bg-blue-600 text-white px-7 py-3.5 rounded-lg text-sm font-semibold tracking-wide border border-blue-700 shadow-sm shadow-blue-600/10 transition-all duration-200 hover:bg-blue-700 hover:border-blue-800 active:scale-[0.99]"
                  >
                    {student ? 'Continue Assessment' : 'Begin Assessment Setup'}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                  </Link>
                  <Link 
                    to="/login" 
                    className="flex items-center justify-center px-7 py-3.5 rounded-lg text-sm font-semibold text-slate-700 border border-slate-200 bg-white shadow-sm hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 transition-all duration-200 active:scale-[0.99]"
                  >
                    Already Registered
                  </Link>
                </div>
              </div>

              {/* Right Column: Premium Dashboard Module */}
              <div className="hidden lg:block lg:col-span-5">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-2xl shadow-slate-950/40 max-w-md mx-auto">
                  {/* System Header Window Bar */}
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-slate-400 bg-slate-800 px-2.5 py-1 rounded border border-slate-700">
                      <Monitor className="w-3 h-3 text-slate-400" />
                      CAT_ENGINE_V2.0
                    </div>
                  </div>

                  {/* System Console Content Simulation */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="h-3.5 bg-blue-500 rounded w-1/4" />
                      <div className="h-2 bg-slate-700 rounded w-full" />
                      <div className="h-2 bg-slate-700 rounded w-4/5" />
                    </div>
                    
                    <div className="pt-4 space-y-2">
                      <div className="h-11 border border-blue-500/30 bg-blue-950/40 rounded-lg flex items-center px-4 text-xs font-mono font-medium text-blue-400 gap-2.5">
                        <span className="animate-pulse inline-block w-2 h-2 rounded-full bg-blue-400" />
                        θ Ability Parameter Calibration...
                      </div>
                      <div className="h-11 border border-slate-800 bg-slate-950/50 rounded-lg flex items-center px-4 text-xs text-slate-500 font-mono">
                        [Response Weight Model Loaded]
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Process Flow Section */}
        <section className="bg-slate-50 border-b border-slate-200/60">
          <div className="max-w-6xl mx-auto px-6 py-24">
            <div className="mb-16 space-y-2">
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-widest block">Process Architecture</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">How the CAT Engine Evaluates</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <GraduationCap className="w-4 h-4 text-slate-700" />,
                  title: '1. Enrollment Profile',
                  body: 'Simple identity configuration captures the base student framework in under a minute.',
                },
                {
                  icon: <BrainCircuit className="w-4 h-4 text-slate-700" />,
                  title: '2. Dynamic Recalibration',
                  body: 'The engine adjusts item difficulty criteria continuously based on real-time question responses.',
                },
                {
                  icon: <Zap className="w-4 h-4 text-slate-700" />,
                  title: '3. Empirical Reports',
                  body: 'Generates definitive parameters and deep skill diagnostic breakdowns immediately on submission.',
                },
              ].map((item, i) => (
                <div key={i} className="bg-white p-8 rounded-xl border border-slate-200/60 shadow-sm transition-all duration-300 hover:shadow-md hover:border-slate-300">
                  <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center mb-6 border border-slate-200/60">
                    {item.icon}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2.5">{item.title}</h3>
                  <p className="text-slate-600 leading-relaxed text-sm">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Curriculum Content Grid Section */}
        <section className="max-w-6xl mx-auto px-6 py-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6 pb-6 border-b border-slate-200/60">
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-widest block">Assessment Map</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Curriculum Scope Covered</h2>
            </div>
            <p className="text-slate-500 max-w-sm text-xs sm:text-sm leading-relaxed">
              Fully mapped structural benchmarks conforming strictly to the standardized national curriculum requirements for JSS2 Mathematics.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              'Algebraic Expressions', 'Linear Equations', 'Fractions & Decimals', 'Percentages',
              'Ratio & Proportion', 'Directed Integers', 'LCM & HCF Matrix', 'Standard Forms',
            ].map(t => (
              <div key={t} className="group flex items-center gap-3 border border-slate-200/70 bg-white p-4 rounded-lg transition-all duration-200 hover:border-slate-400 hover:bg-slate-50/50">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="font-medium text-slate-800 text-sm">{t}</span>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Corporate Technical Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-950">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xs">∑</div>
            <span className="font-mono font-bold text-white tracking-widest text-[11px] uppercase">CAT Assessment System</span>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 text-center sm:text-left">
            <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">© 2026 Mathematics Research Project</p>
            <Link to="/admin/login" className="text-xs text-slate-400 hover:text-white transition-colors sm:border-l sm:border-slate-800 sm:pl-8 py-0.5">
              Researcher Access Portal
            </Link>
          </div>
        </div>
      </footer>
    </PageShell>
  )
}