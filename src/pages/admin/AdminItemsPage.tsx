import { useEffect, useState } from 'react'
import { AdminSidebar } from '@/components/AdminSidebar'
import { 
  SectionHeader, DifficultyBadge, EmptyState, 
  Modal, ErrorMsg, SuccessMsg
} from '@/components/ui'
import { getAllItems, updateItem } from '@/lib/api'
import type { Item } from '@/types'
import { Search, Edit2, Power, Filter, ChevronRight } from 'lucide-react'

export default function AdminItemsPage() {
  const [items, setItems] = useState<Item[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Item | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadItems = async () => {
    try {
      const data = await getAllItems()
      setItems(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadItems() }, [])

  const filteredItems = items.filter(i => 
    i.question.toLowerCase().includes(search.toLowerCase()) || 
    i.item_code.toLowerCase().includes(search.toLowerCase())
  )

  const handleToggleStatus = async (item: Item) => {
    const newStatus = item.item_status === 'Active' ? 'Inactive' : 'Active'
    await updateItem(item.id, { item_status: newStatus })
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, item_status: newStatus } : i))
  }

  const handleSaveEdit = async () => {
    if (!editing) return
    setError('')
    const { error: err } = await updateItem(editing.id, { ...editing })
    if (err) return setError(err)
    
    setItems(prev => prev.map(i => i.id === editing.id ? editing : i))
    setSuccess(`Item ${editing.item_code} updated successfully.`)
    setEditing(null)
    setTimeout(() => setSuccess(''), 3000)
  }

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <AdminSidebar />
      <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full overflow-y-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <SectionHeader
            title="Item Bank"
            subtitle={`${items.filter(i => i.item_status === 'Active').length} operational items in circulation`}
          />
          <div className="flex items-center gap-3">
             <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search code or content..." 
                  className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 outline-none w-64 shadow-sm transition-all"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
             </div>
             <button className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 shadow-sm">
                <Filter className="w-4 h-4" />
             </button>
          </div>
        </div>

        {success && <div className="mb-6"><SuccessMsg message={success} /></div>}

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-12 bg-slate-50 animate-pulse rounded-lg" />)}
            </div>
          ) : filteredItems.length === 0 ? (
            <EmptyState message="No items found matching your criteria." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200 text-[11px] uppercase tracking-widest text-slate-500">
                    <th className="px-6 py-4 font-semibold text-center">Code</th>
                    <th className="px-6 py-4 font-semibold">Content Detail</th>
                    <th className="px-6 py-4 font-semibold text-center">b-Value</th>
                    <th className="px-6 py-4 font-semibold">Difficulty</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredItems.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 text-center">
                        <span className="font-mono text-[11px] bg-slate-100 text-slate-600 px-2 py-1 rounded">
                          {item.item_code}
                        </span>
                      </td>
                      <td className="px-6 py-4 max-w-sm">
                        <div className="flex flex-wrap gap-1 mb-1">
                          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter">{item.topic}</span>
                          <ChevronRight className="w-3 h-3 text-slate-300" />
                          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">{item.sub_topic}</span>
                        </div>
                        <p className="text-sm text-slate-700 line-clamp-2 leading-snug" title={item.question}>
                          {item.question}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`font-mono text-xs font-bold ${item.rasch_b_value > 1 ? 'text-rose-600' : item.rasch_b_value < -1 ? 'text-emerald-600' : 'text-slate-600'}`}>
                          {item.rasch_b_value >= 0 ? '+' : ''}{Number(item.rasch_b_value).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <DifficultyBadge level={item.difficulty_level} />
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => handleToggleStatus(item)}
                          className={`flex items-center gap-2 px-2 py-1 rounded-full border transition-all ${
                            item.item_status === 'Active' 
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                            : 'bg-slate-50 border-slate-200 text-slate-400'
                          }`}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full ${item.item_status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                          <span className="text-[10px] font-bold uppercase">{item.item_status}</span>
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => { setEditing(item); setError(''); setSuccess('') }}
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

      {/* Modernized Edit Modal */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title={`Edit Item ${editing?.item_code}`}>
        {editing && (
          <div className="space-y-5 p-1">
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 block">Category</label>
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
                className="w-full text-sm p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none min-h-[100px] leading-relaxed transition-all"
                value={editing.question}
                onChange={e => setEditing({ ...editing, question: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(['a','b','c','d'] as const).map(opt => (
                <div key={opt} className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">{opt}</span>
                  <input
                    className="w-full pl-8 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:border-slate-900 outline-none transition-colors"
                    value={(editing as any)[`option_${opt}`]}
                    onChange={e => setEditing({ ...editing, [`option_${opt}`]: e.target.value } as Item)}
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center gap-6 p-4 bg-slate-900 rounded-xl text-white">
              <div className="flex-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Correct Key</label>
                <div className="flex gap-2">
                   {['A','B','C','D'].map(o => (
                     <button 
                       key={o}
                       onClick={() => setEditing({ ...editing, correct_answer: o as any })}
                       className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${editing.correct_answer === o ? 'bg-white text-slate-900' : 'bg-white/10 hover:bg-white/20'}`}
                     >
                       {o}
                     </button>
                   ))}
                </div>
              </div>
              <div className="w-32">
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Rasch b</label>
                <input
                  type="number"
                  step="0.1"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-sm font-mono focus:outline-none"
                  value={editing.rasch_b_value}
                  onChange={e => setEditing({ ...editing, rasch_b_value: parseFloat(e.target.value) })}
                />
              </div>
            </div>

            {error && <ErrorMsg message={error} />}
            
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
              <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">Cancel</button>
              <button onClick={handleSaveEdit} className="px-6 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 shadow-lg shadow-slate-200 transition-all">Save Item Changes</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}