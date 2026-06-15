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
  Layers, 
  Binary, 
  Compass, 
  Sparkles,
  Search
} from 'lucide-react'

export default function LandingPage() {
  const { student } = useStudentAuth()
  const primaryLink = student ? '/instructions' : '/register'
  const [activeCategory, setActiveCategory] = useState('all')

  // Multi-field categories for global appeal
  const categories = [
    { id: 'all', label: 'All Disciplines' },
    { id: 'stem', label: 'STEM & Logic' },
    { id: 'humanities', label: 'Humanities' },
    { id: 'professional', label: 'Professional & Certs' }
  ]

  const fieldsOfStudy = [
    { name: 'Mathematics & Rasch Analytics', category: 'stem' },
    { name: 'Data Structures & Algorithms', category: 'stem' },
    { name: 'Quantum & Classical Physics', category: 'stem' },
    { name: 'Applied Statistics', category: 'stem' },
    { name: 'English & Advanced Philology', category: 'humanities' },
    { name: 'Global History & Geopolitics', category: 'humanities' },
    { name: 'Macroeconomics & Finance', category: 'professional' },
    { name: 'Aptitude & Cognitive Profiling', category: 'professional' },
  ]

  const filteredFields = activeCategory === 'all' 
    ? fieldsOfStudy 
    : fieldsOfStudy.filter(f => f.category === activeCategory)

  return (
    <PageShell className="min-h-screen bg-slate-50 flex flex-col antialiased selection:bg-blue-600/10 selection:text-blue-700">
      <StudentNav />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative border-b border-slate-200/60 bg-gradient-to-b from-white via-white to-slate-50/50 overflow-hidden">
          {/* Enhanced Structural Grid Pattern with radial fade */}
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-70" />
          
          <div className="max-w-7xl mx-auto px-6 pt-24 pb-28 md:pt-32 md:pb-40">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
              
              {/* Left Column: Context & Global Appeal Copy */}
              <div className="lg:col-span-7 space-y-8 text-center lg:text-left flex flex-col items-center lg:items-start">
                {/* Global Micro Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold tracking-wide shadow-sm">
                  <Globe2 className="w-3.5 h-3.5 text-blue-600 animate-spin-slow" />
                  <span>Universal Psychometric Assessment Framework</span>
                </div>
                
                {/* Broadened Premium Headings */}
                <div className="space-y-4 w-full">
                  <h1 className="font-sans text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.15]">
                    Adaptive Evaluation for <br />
                    <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">
                      Every Field of Learning
                    </span>
                  </h1>
                  
                  <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0">
                    An intelligent, cross-disciplinary testing engine that calibrates dynamically to a candidate's real-time capability matrix. High-precision benchmarking designed for universal academic and professional tracking.
                  </p>
                </div>

                {/* Primary Actions Matrix */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2 w-full sm:w-auto">
                  <Link 
                    to={primaryLink} 
                    className="group flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl text-sm font-semibold tracking-wide shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                  >
                    {student ? 'Continue System Assessment' : 'Initialize Assessment'}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                  </Link>
                  <Link 
                    to="/login" 
                    className="flex items-center justify-center px-8 py-4 rounded-xl text-sm font-semibold text-slate-700 border border-slate-200 bg-white shadow-sm hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                  >
                    Returning Candidate
                  </Link>
                </div>

                {/* Quick stats banner for immediate visual impact */}
                <div className="pt-6 grid grid-cols-3 gap-6 border-t border-slate-200/80 w-full max-w-lg">
                  <div>
                    <p className="text-xl md:text-2xl font-bold text-slate-900">Rasch</p>
                    <p className="text-xs text-slate-500 font-medium">Mathematical Model</p>
                  </div>
                  <div>
                    <p className="text-xl md:text-2xl font-bold text-slate-900">Multi</p>
                    <p className="text-xs text-slate-500 font-medium">Domain Testing</p>
                  </div>
                  <div>
                    <p className="text-xl md:text-2xl font-bold text-slate-900">Real-Time</p>
                    <p className="text-xs text-slate-500 font-medium">Theta Calibration</p>
                  </div>
                </div>
              </div>

              {/* Right Column: Upgraded System Dashboard Module */}
              <div className="hidden lg:block lg:col-span-5">
                <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl shadow-2xl shadow-slate-950/50 max-w-md mx-auto relative group">
                  <div className="absolute -inset-px bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* System Header Window Bar */}
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-900 relative z-10">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/80" />
                      <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                      <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-slate-400 bg-slate-900 px-3 py-1 rounded-md border border-slate-800">
                      <Monitor className="w-3 h-3 text-blue-500" />
                      CORE_CAT_ENGINE_V3.0
                    </div>
                  </div>

                  {/* System Console Content Simulation */}
                  <div className="space-y-4 relative z-10">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="h-4 bg-indigo-500 rounded w-1/3" />
                        <span className="text-[10px] font-mono text-emerald-400">READY</span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded w-full" />
                      <div className="h-2 bg-slate-800 rounded w-4/5" />
                    </div>
                    
                    <div className="pt-4 space-y-2.5">
                      <div className="h-12 border border-blue-500/20 bg-blue-950/30 rounded-xl flex items-center justify-between px-4 text-xs font-mono font-medium text-blue-400">
                        <div className="flex items-center gap-2.5">
                          <span className="animate-ping inline-block w-2 h-2 rounded-full bg-blue-400" />
                          <span>θ Evaluation Vector: [Global Map]</span>
                        </div>
                      </div>
                      <div className="h-12 border border-slate-900 bg-slate-900/40 rounded-xl flex items-center px-4 text-xs text-slate-400 font-mono justify-between">
                        <span>[Rasch Parameter Weighting]</span>
                        <Binary className="w-4 h-4 text-slate-600" />
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
            <div className="mb-16 text-center space-y-3">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block">Core Architecture</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">How the CAT Framework Evaluates</h2>
              <p className="text-slate-500 max-w-xl mx-auto text-sm">
                Engineered to accurately parse metadata matrices across diverse subject terrains.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <GraduationCap className="w-5 h-5 text-blue-600" />,
                  title: '1. Framework Calibration',
                  body: 'The engine registers parameters across target fields, initializing the benchmark metrics mapped instantly to global syllabi.',
                },
                {
                  icon: <BrainCircuit className="w-5 h-5 text-indigo-600" />,
                  title: '2. Dynamic Recalibration',
                  body: 'As responses stream in, the Rasch engine shifts difficulty parameters step-by-step to lock onto true candidate capability.',
                },
                {
                  icon: <Sparkles className="w-5 h-5 text-purple-600" />,
                  title: '3. Multi-Field Diagnostics',
                  body: 'Receive granular analytical breakdowns mapping exact operational speed, accuracy vectors, and deep proficiency metrics.',
                },
              ].map((item, i) => (
                <div key={i} className="bg-white p-8 rounded-2xl border border-slate-200/60 shadow-sm transition-all duration-300 hover:shadow-md hover:border-slate-300 relative group">
                  <div className="w-11 h-11 bg-slate-50 rounded-xl flex items-center justify-center mb-6 border border-slate-100 group-hover:scale-105 transition-transform duration-200">
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-slate-600 leading-relaxed text-sm">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Dynamic & Interactive Field Mapping Section */}
        <section className="max-w-6xl mx-auto px-6 py-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 pb-6 border-b border-slate-200/60">
            <div className="space-y-2">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block">Assessment Matrix</span>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Supported Fields of Study</h2>
            </div>
            <p className="text-slate-500 max-w-sm text-sm leading-relaxed">
              Fully customized diagnostic evaluations scaling seamlessly into multiple core streams of global knowledge.
            </p>
          </div>

          {/* Interactive filter pills to improve UX */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  activeCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Fields Display */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 transition-all duration-300">
            {filteredFields.map(field => (
              <div 
                key={field.name} 
                className="group flex items-center gap-3 border border-slate-200/70 bg-white p-4 rounded-xl transition-all duration-200 hover:border-slate-300 hover:bg-slate-50/50 hover:shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-slate-700 text-xs sm:text-sm">{field.name}</span>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Corporate Technical Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-500/20">
              ∑
            </div>
            <span className="font-mono font-bold text-white tracking-widest text-[11px] uppercase">Universal CAT Infrastructure</span>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 text-center sm:text-left">
            <p className="text-[10px] font-mono uppercase tracking-wider text-slate-600">© 2026 Adaptive Metrics Research Initiative</p>
            <Link to="/admin/login" className="text-xs text-slate-400 hover:text-white transition-colors sm:border-l sm:border-slate-800 sm:pl-8 py-0.5">
              System Administrator Portal
            </Link>
          </div>
        </div>
      </footer>
    </PageShell>
  )
}
