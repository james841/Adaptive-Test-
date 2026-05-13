import { useLocation, Navigate, Link } from 'react-router-dom'
import { StudentNav } from '@/components/StudentNav'
import { PageShell, AbilityBadge } from '@/components/ui'
import { classifyAbility } from '@/lib/catEngine'
import { Timer, Hash, Target, ChevronRight, RotateCcw, Home, Info, CheckCircle2, XCircle } from 'lucide-react'
import type { CATResponse } from '@/types'

interface ResultState {
  finalTheta: number
  finalSem: number
  totalItems: number
  totalCorrect: number
  timeTakenMs: number
  responses: CATResponse[]
}

function fmtTime(ms: number) {
  const s = Math.round(ms / 1000)
  if (s < 60) return `${s}s`
  return `${Math.floor(s / 60)}m ${s % 60}s`
}

export default function ResultPage() {
  const { state } = useLocation()
  if (!state) return <Navigate to="/" replace />

  const {
    finalTheta, finalSem, totalItems, totalCorrect, timeTakenMs, responses,
  } = state as ResultState

  const level = classifyAbility(finalTheta)
  const accuracy = Math.round((totalCorrect / totalItems) * 100)

  const levelMessages = {
    High: {
      msg: 'Excellent performance! You demonstrated strong mastery of the material.',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    Average: {
      msg: 'Good effort. You have a solid foundation with room to grow.',
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    Low: {
      msg: 'Keep practising. With effort, you will improve your mathematics skills.',
      color: 'text-amber-600',
      bg: 'bg-amber-50'
    },
  }

  return (
    <PageShell>
      <StudentNav />
      <main className="max-w-3xl mx-auto px-6 py-12 md:py-20 w-full overflow-hidden">
        
        {/* Success Header */}
        <div className="text-center mb-12 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">
            <CheckCircle2 className="w-3 h-3" />
            Assessment Finalized
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 mb-4">Great Job!</h1>
          <div className={`inline-block px-6 py-3 rounded-2xl ${levelMessages[level].bg} ${levelMessages[level].color} max-w-lg`}>
            <p className="text-sm font-medium leading-relaxed">{levelMessages[level].msg}</p>
          </div>
        </div>

        {/* High-Impact Score Card */}
        <div className="relative bg-slate-900 rounded-3xl p-8 md:p-10 shadow-2xl shadow-slate-900/20 mb-8 overflow-hidden animate-fade-up animate-delay-100">
          {/* Background Decorative Element */}
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Target className="w-32 h-32 text-white" />
          </div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mb-2">Ability Estimate</p>
              <div className="flex items-baseline gap-3">
                <span className="text-7xl font-display font-bold text-white tracking-tighter">
                  {finalTheta >= 0 ? '+' : ''}{finalTheta.toFixed(2)}
                </span>
                <span className="text-slate-500 font-mono text-sm uppercase">logits</span>
              </div>
              <p className="text-slate-500 text-xs mt-4 flex items-center gap-1.5">
                <Info className="w-3 h-3" />
                Calculated via Rasch-Model Adaptive Engine
              </p>
            </div>

            <div className="flex flex-col justify-between items-start md:items-end">
              <div className="text-left md:text-right">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mb-3">Classification</p>
                <div className="scale-125 origin-left md:origin-right inline-block">
                  <AbilityBadge level={level} />
                </div>
              </div>
              
              <div className="mt-8 grid grid-cols-3 gap-6 w-full pt-8 border-t border-slate-800">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">SEM</p>
                  <p className="text-white font-mono">{finalSem.toFixed(3)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Items</p>
                  <p className="text-white font-mono">{totalItems}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Time</p>
                  <p className="text-white font-mono">{fmtTime(timeTakenMs)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Accuracy Progress */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm animate-fade-up animate-delay-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                  <Target className="w-4 h-4" />
                </div>
                <span className="font-bold text-slate-800 text-sm uppercase tracking-wider">Accuracy</span>
              </div>
              <span className="text-xs font-bold text-slate-400 font-mono">{totalCorrect} / {totalItems}</span>
            </div>
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
               <div 
                 className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out" 
                 style={{ width: `${accuracy}%` }}
               />
            </div>
            <p className="mt-3 text-right text-2xl font-display font-bold text-slate-900">{accuracy}%</p>
          </div>

          {/* Quick Metrics */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm animate-fade-up animate-delay-200">
             <div className="grid grid-cols-2 h-full items-center">
                <div className="flex items-center gap-3">
                  <Timer className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Duration</p>
                    <p className="font-bold text-slate-900">{fmtTime(timeTakenMs)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Hash className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Questions</p>
                    <p className="font-bold text-slate-900">{totalItems} Solved</p>
                  </div>
                </div>
             </div>
          </div>
        </div>

        {/* Item Breakdown */}
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm animate-fade-up animate-delay-300 mb-10">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Response Analytics</h3>
            <span className="text-xs text-slate-400">Chronological Order</span>
          </div>
          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {responses.map((r, i) => (
              <div key={i} className="group px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-1.5 rounded-full ${r.isCorrect ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                    {r.isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{r.item.sub_topic}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-tighter">Level b={r.item.rasch_b_value}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono font-bold text-slate-700">θ {r.thetaAfter.toFixed(2)}</p>
                  <p className="text-[10px] text-slate-400 uppercase">Current Estimate</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 animate-fade-up animate-delay-400">
          <Link to="/instructions" className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-600 transition-all hover:shadow-lg hover:shadow-blue-200">
            <RotateCcw className="w-4 h-4" />
            Take Test Again
          </Link>
          <Link to="/" className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-600 px-8 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-all">
            <Home className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </main>
    </PageShell>
  )
}