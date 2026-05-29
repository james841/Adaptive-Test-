import { Link } from 'react-router-dom'
import { StudentNav } from '@/components/StudentNav'
import { PageShell } from '@/components/ui'
import { useStudentAuth } from '@/context/StudentAuthContext'
import { ArrowRight, BookOpen, BrainCircuit, Zap, GraduationCap, CheckCircle2, Monitor } from 'lucide-react'

export default function LandingPage() {
  const { student } = useStudentAuth()
  const primaryLink = student ? '/instructions' : '/register'

  return (
    <PageShell className="min-h-screen bg-slate-50 flex flex-col selection:bg-blue-600/10 selection:text-blue-600">
      <StudentNav />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative max-w-7xl mx-auto px-6 pt-20 pb-28 md:pt-32 md:pb-36 overflow-hidden">
          {/* Crisp Geometric Background Grid */}
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-50" />
          
          <div className="absolute top-12 right-12 -z-10 opacity-[0.03] select-none pointer-events-none hidden lg:block">
            <h1 className="text-[20rem] font-mono font-black leading-none tracking-tighter">
              ∑ ∫ √
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-7 max-w-2xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold tracking-wider uppercase mb-6">
                <Zap className="w-3.5 h-3.5 fill-blue-600 text-blue-600" />
                Rasch-Based Adaptive Testing
              </div>
              
              {/* Main Headline */}
              <h1 className="font-sans text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 leading-[1.05] mb-6">
                STUDENTS<br />
                <span className="text-blue-600">ASSESSMENT</span>
              </h1>
              
              {/* Subtitle */}
              <p className="text-slate-600 text-lg md:text-xl leading-relaxed mb-10 max-w-xl">
                An intelligent system that adjusts to your ability in real-time. 
                Get questions tailored to your skill level with high-precision testing built for 
                <span className="text-slate-900 font-semibold"> JSS2 Students.</span>
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to={primaryLink} 
                  className="group flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold shadow-md shadow-blue-600/10 transition-all duration-200 hover:bg-blue-700 hover:shadow-lg active:scale-[0.98]"
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

            {/* Premium Refined Engine Widget */}
            <div className="hidden lg:block lg:col-span-5 relative">
              <div className="relative bg-white border border-slate-200 p-6 rounded-2xl shadow-xl shadow-slate-200/60 max-w-md mx-auto">
                {/* Header Window Bar */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-slate-200" />
                    <div className="w-3 h-3 rounded-full bg-slate-200" />
                    <div className="w-3 h-3 rounded-full bg-slate-200" />
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                    <Monitor className="w-3 h-3 text-slate-400" />
                    CAT_ENGINE_v2.0
                  </div>
                </div>

                {/* Content Simulation */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="h-3 bg-slate-900 rounded w-1/3" />
                    <div className="h-2 bg-slate-200 rounded w-full" />
                    <div className="h-2 bg-slate-200 rounded w-5/6" />
                  </div>
                  
                  <div className="pt-4 space-y-2.5">
                    <div className="h-11 border border-blue-200 bg-blue-50/50 rounded-xl flex items-center px-4 text-xs font-mono font-medium text-blue-700 gap-2">
                      <span className="animate-pulse inline-block w-2 h-2 rounded-full bg-blue-600" />
                      &theta; Ability Parameter Calibration...
                    </div>
                    <div className="h-11 border border-slate-100 bg-slate-50/50 rounded-xl flex items-center px-4 text-xs text-slate-400 font-mono">
                      [Response Weight Configured]
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features / How it Works */}
        <section className="bg-white border-y border-slate-200">
          <div className="max-w-6xl mx-auto px-6 py-24">
            <div className="mb-16 text-center">
              <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">Process Blueprint</h2>
              <p className="text-3xl md:text-4xl font-sans font-extrabold text-slate-900 tracking-tight">How it works</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <GraduationCap className="w-5 h-5 text-blue-600" />,
                  title: 'Register & Profile',
                  body: 'Quick setup with your name and school details. Ready in seconds.',
                },
                {
                  icon: <BrainCircuit className="w-5 h-5 text-blue-600" />,
                  title: 'Adaptive Engine',
                  body: 'The CAT engine recalibrates after every answer to find your true ability level.',
                },
                {
                  icon: <Zap className="w-5 h-5 text-blue-600" />,
                  title: 'Instant Precision',
                  body: 'Receive a detailed capability breakdown immediately upon completion.',
                },
              ].map((item, i) => (
                <div key={i} className="bg-slate-50 p-8 rounded-2xl border border-slate-200/60 transition-all duration-200 hover:bg-white hover:border-slate-300 hover:shadow-lg hover:shadow-slate-100">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-6 shadow-sm border border-slate-200">
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-600 leading-relaxed text-sm">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Topics Section */}
        <section className="max-w-6xl mx-auto px-6 py-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="text-left">
              <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">Curriculum Blueprint</h2>
              <p className="text-3xl md:text-4xl font-sans font-extrabold text-slate-900 tracking-tight">Topics Covered</p>
            </div>
            <p className="text-slate-500 max-w-sm text-sm leading-relaxed">
              Comprehensive evaluation blueprints spanning the official national curriculum guidelines for JSS2 Mathematics.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              'Algebra', 'Linear Equations', 'Fractions', 'Percentages',
              'Ratio', 'Integers', 'LCM & HCF', 'Standard Form',
            ].map(t => (
              <div key={t} className="group flex items-center gap-3 border border-slate-200 bg-white p-4 rounded-xl transition-all duration-200 hover:border-blue-400 hover:shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors duration-200 shrink-0" />
                <span className="font-medium text-slate-700 group-hover:text-slate-900 transition-colors duration-200 text-sm">{t}</span>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">∑</div>
            <span className="font-mono font-bold text-white tracking-widest text-xs uppercase">CAT System</span>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 text-center sm:text-left">
            <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500">© 2026 Mathematics Research Project</p>
            <Link to="/admin/login" className="text-xs text-slate-400 hover:text-white transition-colors sm:border-l sm:border-slate-800 sm:pl-8 py-1">
              Researcher Portal
            </Link>
          </div>
        </div>
      </footer>
    </PageShell>
  )
}