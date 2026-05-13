import { Link } from 'react-router-dom'
import { StudentNav } from '@/components/StudentNav'
import { PageShell } from '@/components/ui'
import { ArrowRight, BookOpen, BrainCircuit, Zap, GraduationCap } from 'lucide-react'

export default function LandingPage() {
  return (
    <PageShell>
      <StudentNav />

      <main className="flex-1 overflow-hidden">
        {/* Hero Section */}
        <section className="relative max-w-6xl mx-auto px-6 py-20 md:py-32">
          {/* Subtle Background Math Pattern */}
          <div className="absolute top-10 right-0 -z-10 opacity-[0.03] select-none pointer-events-none">
            <h1 className="text-[20rem] font-display font-bold leading-none">
              ∑ ∫ √
            </h1>
          </div>

          <div className="animate-fade-up max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold tracking-wider uppercase mb-6">
              <Zap className="w-3 h-3" />
              Rasch-Based Adaptive Testing
            </div>
            
            <h1 className="font-display text-6xl md:text-8xl tracking-tight text-slate-900 leading-[0.9] mb-8">
              MATHEMATICS<br />
              <span className="text-blue-600">ASSESSMENT</span>
            </h1>
            
            <p className="text-slate-600 text-xl max-w-xl leading-relaxed mb-10">
              An intelligent system that adjusts to your ability in real-time. 
              Get questions tailored to your skill level precision testing for 
              <span className="text-slate-900 font-semibold"> Students.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register" className="group flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-xl font-bold transition-all hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-200">
                Start My Assessment
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/login" className="flex items-center justify-center px-8 py-4 rounded-xl font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors">
                Already registered
              </Link>
            </div>
          </div>
        </section>

        {/* Features / How it Works */}
        <section className="bg-slate-50 border-y border-slate-200">
          <div className="max-w-6xl mx-auto px-6 py-20">
            <div className="mb-12">
              <h2 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-2">Process</h2>
              <p className="text-3xl font-display text-slate-900">How it works</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <GraduationCap className="w-6 h-6 text-blue-600" />,
                  title: 'Register & Profile',
                  body: 'Quick setup with your name and school details. Ready in seconds.',
                },
                {
                  icon: <BrainCircuit className="w-6 h-6 text-blue-600" />,
                  title: 'Adaptive Engine',
                  body: 'The CAT engine recalibrates after every answer to find your true ability level.',
                },
                {
                  icon: <Zap className="w-6 h-6 text-blue-600" />,
                  title: 'Instant Precision',
                  body: 'Receive a detailed ability score immediately upon completion.',
                },
              ].map((item, i) => (
                <div key={i} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-6">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Topics Section */}
        <section className="max-w-6xl mx-auto px-6 py-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <h2 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-2">Curriculum</h2>
              <p className="text-3xl font-display text-slate-900">Topics covered</p>
            </div>
            <p className="text-slate-500 max-w-md">
              Comprehensive assessment spanning the national curriculum for JSS2 Mathematics.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              'Algebra','Linear Equations','Fractions','Percentages',
              'Ratio','Integers','LCM & HCF','Standard Form',
            ].map(t => (
              <div key={t} className="group flex items-center gap-3 border border-slate-100 bg-slate-50/50 p-4 rounded-xl transition-all hover:bg-white hover:border-blue-200 hover:shadow-sm">
                <div className="w-2 h-2 rounded-full bg-blue-400 group-hover:scale-125 transition-transform" />
                <span className="font-medium text-slate-700">{t}</span>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold">∑</div>
            <span className="font-display text-white tracking-widest text-sm uppercase">CAT System</span>
          </div>
          
          <div className="flex items-center gap-8">
            <p className="text-xs font-mono uppercase tracking-tighter">© 2026 Mathematics Research Project</p>
            <Link to="/admin/login" className="text-xs hover:text-white transition-colors border-l border-slate-800 pl-8">
              Researcher Portal
            </Link>
          </div>
        </div>
      </footer>
    </PageShell>
  )
}