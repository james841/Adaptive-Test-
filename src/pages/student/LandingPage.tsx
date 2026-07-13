import { useState } from 'react'
import { Link } from 'react-router-dom'
import { StudentNav } from '@/components/StudentNav'
import { PageShell } from '@/components/ui'
import { useStudentAuth } from '@/context/StudentAuthContext'
import { 
  ArrowRight, 
  BrainCircuit, 
  Zap, 
  GraduationCap, 
  CheckCircle2, 
  Monitor, 
  Globe2, 
  Binary,
  Search
} from 'lucide-react'

export default function LandingPage() {
  const { student } = useStudentAuth()
  const primaryLink = student ? '/instructions' : '/register'
  const [activeCategory, setActiveCategory] = useState('all')

  const categories = [
    { id: 'all', label: 'All Disciplines' },
    { id: 'stem', label: 'STEM & Logic' },
    { id: 'humanities', label: 'Humanities & Languages' },
    { id: 'professional', label: 'Professional & Aptitude' }
  ]

  const fieldsOfStudy = [
    { name: 'Mathematics & Rasch Analytics', category: 'stem' },
    { name: 'Data Structures & Algorithms', category: 'stem' },
    { name: 'Core Physical Sciences', category: 'stem' },
    { name: 'Applied Statistics & Data', category: 'stem' },
    { name: 'Literature & Philology', category: 'humanities' },
    { name: 'Global History & Geopolitics', category: 'humanities' },
    { name: 'Macroeconomics & Finance', category: 'professional' },
    { name: 'Cognitive Profiling Matrices', category: 'professional' },
  ]

  const filteredFields = activeCategory === 'all' 
    ? fieldsOfStudy 
    : fieldsOfStudy.filter(f => f.category === activeCategory)

  return (
    <PageShell className="min-h-screen bg-slate-50 flex flex-col antialiased selection:bg-blue-600/10 selection:text-blue-700">
      <StudentNav />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative border-b border-slate-200 bg-slate-50 overflow-hidden">
          {/* Subtle Grid Backdrop */}
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-70" />
          
          {/* Accent Glows */}
          <div className="absolute top-1/4 left-1/4 -z-10 w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-blue-100/40 blur-[100px] sm:blur-[128px]" />
          <div className="absolute bottom-1/4 right-1/4 -z-10 w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-slate-200/50 blur-[100px] sm:blur-[128px]" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-20 sm:pt-24 sm:pb-28 lg:pt-32 lg:pb-36">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              
              {/* Left Column */}
              <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left relative">
                {/* Micro Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-blue-700 text-xs font-medium tracking-wide shadow-sm">
                  <Globe2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Universal Psychometric Assessment Engine</span>
                </div>
                
                {/* Typography */}
                <div className="space-y-4">
                  <h1 className="font-sans text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
                    Adaptive Evaluation for <br />
                    <span className="bg-gradient-to-r transition-all from-blue-600 to-blue-500 bg-clip-text text-transparent">Every Field of Learning</span>
                  </h1>
                  
                  <p className="text-slate-600 text-sm sm:text-base md:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
                    An intelligent, cross-disciplinary assessment environment that calibrates dynamically to a candidate's real-time capability metrics. High-precision benchmarking designed for universal academic frameworks.
                  </p>
                </div>

                {/* Main Actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 pt-2">
                  <Link 
                    to={primaryLink} 
                    className="group flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3.5 rounded-lg text-sm font-semibold tracking-wide shadow-sm transition-all duration-150 hover:bg-blue-700 active:scale-[0.98]"
                  >
                    {student ? 'Continue Assessment' : 'Begin Assessment Setup'}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-150" />
                  </Link>
                  <Link 
                    to="/login" 
                    className="flex items-center justify-center px-6 py-3.5 rounded-lg text-sm font-semibold text-slate-700 border border-slate-200 bg-white shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all duration-150 active:scale-[0.98]"
                  >
                    Already Registered
                  </Link>
                </div>

                {/* Analytics Indicators */}
                <div className="pt-8 grid grid-cols-3 gap-4 border-t border-slate-200 max-w-md mx-auto lg:mx-0 text-left">
                  <div>
                    <p className="text-lg font-bold text-slate-900">Rasch</p>
                    <p className="text-[11px] text-slate-500 font-medium">Math Model</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-slate-900">Multi-Field</p>
                    <p className="text-[11px] text-slate-500 font-medium">Calibration</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-slate-900">Real-Time</p>
                    <p className="text-[11px] text-slate-500 font-medium">Theta Est.</p>
                  </div>
                </div>
              </div>

              {/* Right Column: Console Preview (Hidden on Mobile/Tablet) */}
              <div className="hidden lg:block lg:col-span-5 relative">
                <div className="absolute -inset-4 rounded-3xl bg-blue-100/20 blur-2xl -z-10" />

                <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-xl max-w-md mx-auto">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-mono tracking-wider text-slate-400 bg-slate-800/60 px-2.5 py-1 rounded border border-slate-700/50">
                      <Monitor className="w-3 h-3 text-blue-500" />
                      CAT_ENGINE_V2.0
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="h-3.5 bg-blue-500 rounded w-1/4" />
                      <div className="h-2 bg-slate-700 rounded w-full" />
                      <div className="h-2 bg-slate-700 rounded w-4/5" />
                    </div>
                    
                    <div className="pt-2 space-y-2">
                      <div className="h-11 border border-blue-500/20 bg-blue-950/30 rounded-lg flex items-center px-4 text-xs font-mono font-medium text-blue-400 gap-2.5">
                        <span className="animate-pulse inline-block w-2 h-2 rounded-full bg-blue-400" />
                        θ Ability Parameter Calibration...
                      </div>
                      <div className="h-11 border border-slate-800 bg-slate-950/40 rounded-lg flex items-center justify-between px-4 text-xs text-slate-500 font-mono">
                        <span>[Universal Item Mapping Loaded]</span>
                        <Binary className="w-3.5 h-3.5 text-slate-600" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Process Flow Section */}
        <section className="bg-white border-b border-slate-200/60">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
            <div className="mb-12 text-center sm:text-left space-y-1">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block">Process Architecture</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">How the CAT Engine Evaluates</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {[
                {
                  icon: <GraduationCap className="w-4 h-4 text-blue-600" />,
                  title: '1. Framework Profile',
                  body: 'Simple multi-field identity configuration targets the candidate area framework instantly.',
                },
                {
                  icon: <BrainCircuit className="w-4 h-4 text-blue-600" />,
                  title: '2. Dynamic Recalibration',
                  body: 'The engine adjusts item difficulty criteria continuously based on real-time question responses across subjects.',
                },
                {
                  icon: <Zap className="w-4 h-4 text-blue-600" />,
                  title: '3. Empirical Reports',
                  body: 'Generates definitive parameters and deep cross-disciplinary diagnostic breakdowns immediately on submission.',
                },
              ].map((item, i) => (
                <div key={i} className="bg-slate-50 p-6 sm:p-8 rounded-xl border border-slate-200/80 shadow-sm transition-all duration-200 hover:border-slate-300">
                  <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center mb-5 border border-slate-200 shadow-sm">
                    {item.icon}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-600 leading-relaxed text-xs sm:text-sm">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Dynamic Fields Filter Section */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4 pb-6 border-b border-slate-200">
            <div className="space-y-1 text-center md:text-left">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block">Assessment Map</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Syllabus Scope Covered</h2>
            </div>
            <p className="text-slate-500 max-w-sm text-center md:text-left text-xs sm:text-sm leading-relaxed mx-auto md:mx-0">
              Standardized structural item pools conforming strictly to unified cross-disciplinary evaluation parameters globally.
            </p>
          </div>

          {/* Mobile-optimized single horizontal scrollable row */}
          <div className="flex flex-row items-center overflow-x-auto pb-3 mb-6 gap-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-medium border tracking-wide transition-all duration-100 shrink-0 ${
                  activeCategory === cat.id
                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {filteredFields.map(field => (
              <div key={field.name} className="group flex items-center gap-3 border border-slate-200 bg-white p-4 rounded-xl transition-all duration-150 hover:border-blue-500/50 hover:bg-blue-50/20">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="font-medium text-slate-800 text-xs sm:text-sm">{field.name}</span>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Corporate Technical Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10 sm:py-12 border-t border-slate-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white font-semibold text-xs shadow-sm">∑</div>
            <span className="font-mono font-bold text-white tracking-wider text-[11px] uppercase">Universal CAT Infrastructure</span>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 text-center sm:text-left">
            <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">© 2026 Adaptive Metrics Research Initiative</p>
            <Link to="/admin/login" className="text-xs text-slate-400 hover:text-white transition-colors sm:border-l sm:border-slate-800 sm:pl-6 py-0.5">
              System Administrator Portal
            </Link>
          </div>
        </div>
      </footer>
    </PageShell>
  )
}