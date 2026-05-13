import { useState, useEffect, useRef, useCallback } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { StudentNav } from '@/components/StudentNav'
import { PageShell, PageLoader, Spinner } from '@/components/ui'
import { useStudentAuth } from '@/context/StudentAuthContext'
import { Timer, Brain, Target, Info, CheckCircle2, AlertCircle, ArrowRight, Loader2 } from 'lucide-react'
import {
  CAT_CONFIG,
  selectNextItem,
  updateTheta,
  calculateSEM,
  checkStoppingRule,
} from '@/lib/catEngine'
import {
  getActiveItems,
  createTestSession,
  saveResponse,
  completeTestSession,
} from '@/lib/api'
import type { Item, CATResponse, AnswerOption } from '@/types'

export default function TestPage() {
  const { student } = useStudentAuth()
  const navigate = useNavigate()

  const [items, setItems] = useState<Item[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [currentItem, setCurrentItem] = useState<Item | null>(null)
  const [theta, setTheta] = useState<number>(CAT_CONFIG.INITIAL_THETA)
  const [sem, setSem] = useState<number>(99.0)
  const [responses, setResponses] = useState<CATResponse[]>([])
  const [answeredIds, setAnsweredIds] = useState<string[]>([])
  const [selected, setSelected] = useState<AnswerOption | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [showFailureModal, setShowFailureModal] = useState(false)
  const [failureResponses, setFailureResponses] = useState<CATResponse[] | null>(null)
  const [failureTheta, setFailureTheta] = useState(0)
  const [failureSem, setFailureSem] = useState(0)

  const itemStartRef = useRef<number>(Date.now())
  const testStartRef = useRef<number>(Date.now())

  if (!student) return <Navigate to="/login" replace />

  useEffect(() => {
    const init = async () => {
      const [allItems, session] = await Promise.all([
        getActiveItems(),
        createTestSession(student.id),
      ])
      if (!session) { setLoading(false); return }
      setItems(allItems)
      setSessionId(session.id)
      testStartRef.current = Date.now()
      const firstItem = selectNextItem(CAT_CONFIG.INITIAL_THETA, allItems, [])
      setCurrentItem(firstItem)
      itemStartRef.current = Date.now()
      setLoading(false)
    }
    init()
  }, [])

  const finishTest = useCallback(
    async (finalResponses: CATResponse[], finalTheta: number, finalSem: number) => {
      if (!sessionId) return
      await completeTestSession(sessionId, finalTheta, finalSem, finalResponses.length)
      navigate('/result', {
        state: {
          finalTheta,
          finalSem,
          totalItems: finalResponses.length,
          totalCorrect: finalResponses.filter(r => r.isCorrect).length,
          timeTakenMs: Date.now() - testStartRef.current,
          responses: finalResponses,
        },
      })
    },
    [sessionId, navigate],
  )

  const handleSubmit = async () => {
    if (!selected || !currentItem || !sessionId || submitting) return
    setSubmitting(true)
    setRevealed(true)

    const isCorrect = selected === currentItem.correct_answer
    const responseTimeMs = Date.now() - itemStartRef.current
    const thetaBefore = theta

    const newResp: CATResponse = {
      item: currentItem,
      selectedAnswer: selected,
      isCorrect,
      thetaBefore,
      thetaAfter: thetaBefore,
      semAfter: sem,
      responseTimeMs,
    }

    const updatedResponses = [...responses, newResp]
    const newTheta = updateTheta(thetaBefore, updatedResponses)
    const newSem = calculateSEM(newTheta, updatedResponses.map(r => r.item))

    newResp.thetaAfter = newTheta
    newResp.semAfter = newSem

    saveResponse(sessionId, student.id, newResp, updatedResponses.length)

    setTheta(newTheta)
    setSem(newSem)
    setResponses(updatedResponses)
    const newAnswered = [...answeredIds, currentItem.id]
    setAnsweredIds(newAnswered)

    await new Promise(r => setTimeout(r, 900))

    const nextItem = selectNextItem(newTheta, items, newAnswered)
    const stop = checkStoppingRule(updatedResponses.length, newSem, nextItem, updatedResponses)

    if (stop === 'consecutive_failures') {
      setFailureResponses(updatedResponses)
      setFailureTheta(newTheta)
      setFailureSem(newSem)
      setShowFailureModal(true)
      setSubmitting(false)
    } else if (stop) {
      await finishTest(updatedResponses, newTheta, newSem)
    } else {
      setCurrentItem(nextItem)
      setSelected(null)
      setRevealed(false)
      itemStartRef.current = Date.now()
      setSubmitting(false)
    }
  }

  if (loading || !currentItem) return <PageLoader />

  const progress = (responses.length / CAT_CONFIG.MAX_ITEMS) * 100
  const optionMap: Record<AnswerOption, string> = {
    A: currentItem.option_a,
    B: currentItem.option_b,
    C: currentItem.option_c,
    D: currentItem.option_d,
  }

  return (
    <PageShell>
      <StudentNav />

      {/* Persistent Progress Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
           <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
             <div 
               className="h-full bg-blue-600 transition-all duration-500 ease-out" 
               style={{ width: `${progress}%` }} 
             />
           </div>
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
             {responses.length} / {CAT_CONFIG.MAX_ITEMS} Items
           </span>
        </div>
      </div>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8 md:py-12">
        {/* Question Meta */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold">
              {responses.length + 1}
            </div>
            <div>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Current Sub-topic</p>
              <h3 className="font-semibold text-slate-800">{currentItem.sub_topic}</h3>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-6 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase">SEM</p>
              <p className="font-mono text-xs font-bold">{sem > 9 ? '—' : sem.toFixed(3)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Ability</p>
              <p className="font-mono text-xs font-bold">θ {theta.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden mb-8">
          <div className="p-8 md:p-10 bg-slate-50/50 border-b border-slate-200">
            <p className="text-lg md:text-xl text-slate-900 leading-relaxed font-medium italic">
              "{currentItem.question}"
            </p>
          </div>

          <div className="p-6 md:p-8 grid grid-cols-1 gap-3">
            {(Object.keys(optionMap) as AnswerOption[]).map(key => {
              const isSelected = selected === key
              const isCorrect = key === currentItem.correct_answer
              
              let variantCls = "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/30"
              if (revealed) {
                if (isCorrect) variantCls = "border-emerald-500 bg-emerald-50 text-emerald-900"
                else if (isSelected) variantCls = "border-red-500 bg-red-50 text-red-900"
                else variantCls = "border-slate-100 opacity-40"
              } else if (isSelected) {
                variantCls = "border-blue-600 bg-blue-50 ring-2 ring-blue-600/10"
              }

              return (
                <button
                  key={key}
                  disabled={revealed}
                  onClick={() => setSelected(key)}
                  className={`group flex items-center p-4 rounded-2xl border-2 transition-all duration-200 text-left ${variantCls}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-sm font-bold mr-4 transition-colors
                    ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600'}
                    ${revealed && isCorrect ? 'bg-emerald-600 text-white' : ''}
                    ${revealed && isSelected && !isCorrect ? 'bg-red-600 text-white' : ''}
                  `}>
                    {key}
                  </div>
                  <span className="flex-1 font-semibold">{optionMap[key]}</span>
                  {revealed && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600 ml-2" />}
                </button>
              )
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <Info className="w-4 h-4" />
            <p className="text-xs italic">Select your answer and click submit to continue.</p>
          </div>
          
          <button
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold transition-all hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSubmit}
            disabled={!selected || submitting}
          >
            {submitting ? (
              <><Loader2 className="w-5 h-5 animate-spin" /><span>Calculating...</span></>
            ) : (
              <><span>Submit Answer</span><ArrowRight className="w-5 h-5" /></>
            )}
          </button>
        </div>
      </main>

      {/* Failure Modal */}
      {showFailureModal && failureResponses && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center px-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-fade-up">
            <div className="p-1 bg-amber-500" />
            <div className="p-8">
              <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-6">
                <Brain className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-2xl font-display font-bold text-slate-900 mb-2">Feeling Challenged?</h2>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                That’s perfectly normal! Adaptive tests are designed to find your limits. 
                We’ve noticed these questions are a bit tough—would you like to continue and let the system adjust to easier questions, or wrap things up now?
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Solved</p>
                  <p className="text-xl font-bold text-slate-900">{failureResponses.length}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Accuracy</p>
                  <p className="text-xl font-bold text-slate-900">
                    {Math.round((failureResponses.filter(r => r.isCorrect).length / failureResponses.length) * 100)}%
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold transition-all hover:bg-blue-600"
                  onClick={() => {
                    setShowFailureModal(false)
                    setFailureResponses(null)
                  }}
                >
                  Continue Testing
                </button>
                <button
                  className="w-full text-slate-500 py-3 rounded-2xl font-semibold hover:bg-slate-50 transition-colors"
                  onClick={async () => {
                    if (failureResponses) {
                      await finishTest(failureResponses, failureTheta, failureSem)
                    }
                  }}
                >
                  End and See Results
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  )
}