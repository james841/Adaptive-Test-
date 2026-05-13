import { Link, Navigate } from 'react-router-dom'
import { StudentNav } from '@/components/StudentNav'
import { PageShell } from '@/components/ui'
import { useStudentAuth } from '@/context/StudentAuthContext'
import { CAT_CONFIG } from '@/lib/catEngine'
import { ClipboardList, ArrowRight, AlertCircle, CheckCircle2, RotateCcw, BarChart3 } from 'lucide-react'

export default function InstructionsPage() {
  const { student } = useStudentAuth()
  if (!student) return <Navigate to="/login" replace />

  const rules = [
    { text: `Answer up to ${CAT_CONFIG.MAX_ITEMS} mathematics questions.`, icon: <ClipboardList className="w-5 h-5" /> },
    { text: 'Each question has four options: A, B, C, and D.', icon: <CheckCircle2 className="w-5 h-5" /> },
    { text: 'Select your answer and click Submit to move forward.', icon: <ArrowRight className="w-5 h-5" /> },
    { text: 'Note: You cannot go back to a previous question.', icon: <RotateCcw className="w-5 h-5 text-amber-600" />, highlight: true },
    { text: 'The test ends automatically once your level is determined.', icon: <BarChart3 className="w-5 h-5" /> },
  ]

  return (
    <PageShell>
      <StudentNav />
      <main className="flex-1 flex items-center justify-center py-12 px-4 bg-slate-50/50">
        <div className="w-full max-w-2xl animate-fade-up">
          
          {/* Header Section */}
          <div className="text-center mb-10">
            <h2 className="text-sm font-bold tracking-[0.2em] text-blue-600 uppercase mb-3">Assessment Portal</h2>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 mb-4">
              Test Instructions
            </h1>
            <p className="text-slate-600 text-lg">
              Welcome back, <span className="font-semibold text-slate-900">{student.full_name}</span>. 
              Please review the guidelines below.
            </p>
          </div>

          {/* Info Dashboard Strip */}
          <div className="grid grid-cols-3 gap-0.5 bg-slate-200 border border-slate-200 rounded-t-2xl overflow-hidden shadow-sm">
            <div className="bg-white p-4 text-center">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Subject</p>
              <p className="font-semibold text-slate-800">Mathematics</p>
            </div>
            <div className="bg-white p-4 text-center">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Items</p>
              <p className="font-semibold text-slate-800">{CAT_CONFIG.MAX_ITEMS} Max</p>
            </div>
            <div className="bg-white p-4 text-center">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Type</p>
              <p className="font-semibold text-slate-800">Adaptive</p>
            </div>
          </div>

          {/* Instructions Card */}
          <div className="bg-white border-x border-b border-slate-200 rounded-b-2xl shadow-xl shadow-slate-200/60 overflow-hidden mb-8">
            <div className="divide-y divide-slate-100">
              {rules.map((rule, i) => (
                <div 
                  key={i} 
                  className={`flex items-start gap-4 px-6 py-5 transition-colors ${rule.highlight ? 'bg-amber-50/50' : 'hover:bg-slate-50'}`}
                >
                  <div className={`mt-0.5 p-2 rounded-lg ${rule.highlight ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                    {rule.icon}
                  </div>
                  <div className="flex-1">
                    <p className={`text-base leading-relaxed ${rule.highlight ? 'font-medium text-slate-900' : 'text-slate-700'}`}>
                      {rule.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Footer Alert */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-slate-400 shrink-0" />
              <p className="text-sm text-slate-500">
                Ensure you have a stable internet connection before clicking start.
              </p>
            </div>
          </div>

          {/* Action CTA */}
          <div className="flex flex-col items-center">
            <Link 
              to="/test" 
              className="group relative w-full md:w-auto inline-flex items-center justify-center px-10 py-4 font-bold text-white transition-all duration-200 bg-slate-900 rounded-xl hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
            >
              Start My Assessment
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <p className="mt-4 text-xs text-slate-400">
              By clicking start, you agree to the test terms.
            </p>
          </div>

        </div>
      </main>
    </PageShell>
  )
}