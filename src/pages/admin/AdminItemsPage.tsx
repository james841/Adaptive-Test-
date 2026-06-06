import { useEffect, useState } from 'react'
import { AdminSidebar } from '@/components/AdminSidebar'
import {
  SectionHeader, DifficultyBadge, EmptyState,
  Modal, ErrorMsg, SuccessMsg
} from '@/components/ui'
import { getAllItems, updateItem } from '@/lib/api'
import type { Item } from '@/types'
import { Search, Edit2, ChevronRight } from 'lucide-react'

// ─── Auto-derive difficulty level from b-value ────────────────────────────────
function difficultyFromB(b: number): 'Easy' | 'Moderate' | 'Difficult' {
  if (b < -0.5)  return 'Easy'
  if (b <= 1.0)  return 'Moderate'
  return 'Difficult'
}

type FilterDifficulty = 'All' | 'Easy' | 'Moderate' | 'Difficult'
type FilterStatus     = 'All' | 'Active' | 'Inactive'
type FilterTopic      = 'All' | string

export default function AdminItemsPage() {
  const [items,   setItems]   = useState<Item[]>([])
  const [search,  setSearch]  = useState('')
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Item | null>(null)
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState('')

  // ── Filters ────────────────────────────────────────────────────────────────
  const [filterDiff,   setFilterDiff]   = useState<FilterDifficulty>('All')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('All')
  const [filterTopic,  setFilterTopic]  = useState<FilterTopic>('All')

  useEffect(() => {
    getAllItems().then(data => { setItems(data); setLoading(false) })
  }, [])

  // Unique topics for filter dropdown
  const topics = ['All', ...Array.from(new Set(items.map(i => i.topic))).sort()]

  // Apply all filters + search
  const filteredItems = items.filter(i => {
    const matchSearch =
      i.question.toLowerCase().includes(search.toLowerCase()) ||
      i.item_code.toLowerCase().includes(search.toLowerCase()) ||
      i.topic.toLowerCase().includes(search.toLowerCase())

    const matchDiff   = filterDiff   === 'All' || i.difficulty_level === filterDiff
    const matchStatus = filterStatus === 'All' || i.item_status === filterStatus
    const matchTopic  = filterTopic  === 'All' || i.topic === filterTopic

    return matchSearch && matchDiff && matchStatus && matchTopic
  })

  const handleToggleStatus = async (item: Item) => {
    const newStatus = item.item_status === 'Active' ? 'Inactive' : 'Active'
    await updateItem(item.id, { item_status: newStatus })
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, item_status: newStatus } : i))
  }

  const handleSaveEdit = async () => {
    if (!editing) return
    setError('')
    const { error: err } = await updateItem(editing.id, {
      question:         editing.question,
      option_a:         editing.option_a,
      option_b:         editing.option_b,
      option_c:         editing.option_c,
      option_d:         editing.option_d,
      correct_answer:   editing.correct_answer,
      rasch_b_value:    editing.rasch_b_value,
      difficulty_level: editing.difficulty_level,
    })
    if (err) return setError(err)
    setItems(prev => prev.map(i => i.id === editing.id ? editing : i))
    setSuccess(`Item ${editing.item_code} updated successfully.`)
    setEditing(null)
    setTimeout(() => setSuccess(''), 3000)
  }

  // When b-value changes → auto-update difficulty_level
  const handleBValueChange = (val: string) => {
    if (!editing) return
    const b    = parseFloat(val)
    const diff = isNaN(b) ? editing.difficulty_level : difficultyFromB(b)
    setEditing({ ...editing, rasch_b_value: isNaN(b) ? editing.rasch_b_value : b, difficulty_level: diff })
  }

  // Stats
  const activeCount = items.filter(i => i.item_status === 'Active').length
  const totalAdmin  = items.reduce((s, i) => s + (i.times_administered ?? 0), 0)

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <AdminSidebar />
      <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full overflow-y-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Item Bank</h1>
            <p className="text-slate-500 text-sm mt-1">
              {activeCount} active · {items.length} total · {totalAdmin} administrations
            </p>
          </div>
        </div>

        {success && <div className="mb-4"><SuccessMsg message={success} /></div>}

        {/* Search + Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search code, question, topic..."
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 outline-none w-64 shadow-sm"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Difficulty filter */}
          <div className="flex items-center gap-1">
            {(['All','Easy','Moderate','Difficult'] as FilterDifficulty[]).map(f => (
              <button
                key={f}
                onClick={() => setFilterDiff(f)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  filterDiff === f
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1">
            {(['All','Active','Inactive'] as FilterStatus[]).map(f => (
              <button
                key={f}
                onClick={() => setFilterStatus(f)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  filterStatus === f
                    ? 'bg-emerald-700 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Topic filter */}
          <select
            value={filterTopic}
            onChange={e => setFilterTopic(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            {topics.map(t => <option key={t}>{t}</option>)}
          </select>

          {/* Result count */}
          <span className="text-xs text-slate-400 ml-auto">
            {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-4">
              {[1,2,3,4,5].map(i => <div key={i} className="h-12 bg-slate-50 animate-pulse rounded-lg" />)}
            </div>
          ) : filteredItems.length === 0 ? (
            <EmptyState message="No items match your filters." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200 text-[11px] uppercase tracking-widest text-slate-500">
                    <th className="px-4 py-4 font-semibold text-center">Code</th>
                    <th className="px-4 py-4 font-semibold">Content</th>
                    <th className="px-4 py-4 font-semibold text-center">b-Value</th>
                    <th className="px-4 py-4 font-semibold">Difficulty</th>
                    <th className="px-4 py-4 font-semibold text-center">Administered</th>
                    <th className="px-4 py-4 font-semibold text-center">Correct</th>
                    <th className="px-4 py-4 font-semibold text-center">Exposure</th>
                    <th className="px-4 py-4 font-semibold">Status</th>
                    <th className="px-4 py-4 font-semibold text-right">Edit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredItems.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-center">
                        <span className="font-mono text-[11px] bg-slate-100 text-slate-600 px-2 py-1 rounded">
                          {item.item_code}
                        </span>
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <div className="flex items-center gap-1 mb-0.5">
                          <span className="text-[10px] font-bold text-blue-600 uppercase">{item.topic}</span>
                          <ChevronRight className="w-3 h-3 text-slate-300" />
                          <span className="text-[10px] text-slate-400">{item.sub_topic}</span>
                        </div>
                        <p className="text-xs text-slate-700 line-clamp-1" title={item.question}>
                          {item.question}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`font-mono text-xs font-bold ${
                          item.rasch_b_value > 1   ? 'text-rose-600'
                          : item.rasch_b_value < -1 ? 'text-emerald-600'
                          : 'text-slate-600'
                        }`}>
                          {item.rasch_b_value >= 0 ? '+' : ''}{Number(item.rasch_b_value).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <DifficultyBadge level={item.difficulty_level} />
                      </td>
                      {/* times_administered */}
                      <td className="px-4 py-3 text-center font-mono text-xs text-slate-600">
                        {item.times_administered ?? 0}
                      </td>
                      {/* times_correct */}
                      <td className="px-4 py-3 text-center font-mono text-xs text-slate-600">
                        {item.times_correct ?? 0}
                        {(item.times_administered ?? 0) > 0 && (
                          <span className="text-[10px] text-slate-400 ml-1">
                            ({Math.round(((item.times_correct ?? 0) / item.times_administered!) * 100)}%)
                          </span>
                        )}
                      </td>
                      {/* exposure_rate */}
                      <td className="px-4 py-3 text-center">
                        <span className={`font-mono text-xs font-bold ${
                          (item.exposure_rate ?? 0) > 0.5  ? 'text-rose-600'
                          : (item.exposure_rate ?? 0) > 0.25 ? 'text-amber-600'
                          : 'text-slate-500'
                        }`}>
                          {((item.exposure_rate ?? 0) * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleStatus(item)}
                          className={`flex items-center gap-1.5 px-2 py-1 rounded-full border text-[10px] font-bold uppercase transition-all ${
                            item.item_status === 'Active'
                              ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                              : 'bg-slate-50 border-slate-200 text-slate-400'
                          }`}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            item.item_status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
                          }`} />
                          {item.item_status}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => { setEditing(item); setError('') }}
                          className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Edit Modal */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title={`Edit — ${editing?.item_code}`}>
        {editing && (
          <div className="space-y-5 p-1">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 block">Topic</label>
                <div className="text-xs font-semibold text-slate-700 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 italic">
                  {editing.topic}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 block">Item Code</label>
                <div className="text-xs font-mono text-slate-700 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                  {editing.item_code}
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 block tracking-widest">Question Text</label>
              <textarea
                className="w-full text-sm p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none min-h-[90px] leading-relaxed transition-all"
                value={editing.question}
                onChange={e => setEditing({ ...editing, question: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(['a','b','c','d'] as const).map(opt => (
                <div key={opt} className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">{opt}</span>
                  <input
                    className="w-full pl-8 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:border-slate-900 outline-none"
                    value={(editing as any)[`option_${opt}`]}
                    onChange={e => setEditing({ ...editing, [`option_${opt}`]: e.target.value } as Item)}
                  />
                </div>
              ))}
            </div>

            {/* Correct answer + b-value + auto difficulty */}
            <div className="flex items-start gap-4 p-4 bg-slate-900 rounded-xl text-white">
              {/* Correct answer */}
              <div className="flex-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Correct Answer</label>
                <div className="flex gap-2">
                  {['A','B','C','D'].map(o => (
                    <button
                      key={o}
                      onClick={() => setEditing({ ...editing, correct_answer: o as any })}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                        editing.correct_answer === o ? 'bg-white text-slate-900' : 'bg-white/10 hover:bg-white/20'
                      }`}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>

              {/* b-value — auto updates difficulty */}
              <div className="w-36">
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">
                  Rasch b-value
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="-4"
                  max="4"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-sm font-mono focus:outline-none"
                  value={editing.rasch_b_value}
                  onChange={e => handleBValueChange(e.target.value)}
                />
                {/* Live difficulty preview */}
                <p className="text-[10px] mt-1.5 text-slate-400">
                  Auto-difficulty:{' '}
                  <span className={`font-bold ${
                    editing.difficulty_level === 'Easy'      ? 'text-emerald-400'
                    : editing.difficulty_level === 'Moderate' ? 'text-amber-400'
                    : 'text-rose-400'
                  }`}>
                    {editing.difficulty_level}
                  </span>
                </p>
              </div>
            </div>

            {error && <ErrorMsg message={error} />}

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-800">
                Cancel
              </button>
              <button onClick={handleSaveEdit} className="px-6 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-all">
                Save Changes
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}