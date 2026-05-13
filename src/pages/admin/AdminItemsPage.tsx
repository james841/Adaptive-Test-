import { useEffect, useState } from 'react'
import { AdminSidebar } from '@/components/AdminSidebar'
import { SectionHeader, DifficultyBadge, EmptyState, Modal, ErrorMsg, SuccessMsg } from '@/components/ui'
import { getAllItems, updateItem } from '@/lib/api'
import type { Item } from '@/types'

export default function AdminItemsPage() {
  const [items,   setItems]   = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Item | null>(null)
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState('')

  const loadItems = async () => {
    const data = await getAllItems()
    setItems(data)
    setLoading(false)
  }

  useEffect(() => { loadItems() }, [])

  const handleToggleStatus = async (item: Item) => {
    const newStatus = item.item_status === 'Active' ? 'Inactive' : 'Active'
    await updateItem(item.id, { item_status: newStatus })
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, item_status: newStatus } : i))
  }

  const handleSaveEdit = async () => {
    if (!editing) return
    setError('')
    const { error: err } = await updateItem(editing.id, {
      question:       editing.question,
      option_a:       editing.option_a,
      option_b:       editing.option_b,
      option_c:       editing.option_c,
      option_d:       editing.option_d,
      correct_answer: editing.correct_answer,
      rasch_b_value:  editing.rasch_b_value,
      difficulty_level: editing.difficulty_level,
    })
    if (err) return setError(err)
    setItems(prev => prev.map(i => i.id === editing.id ? editing : i))
    setSuccess('Item updated successfully.')
    setEditing(null)
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <SectionHeader
          title="ITEM BANK"
          subtitle={`${items.filter(i => i.item_status === 'Active').length} active items`}
        />

        {success && <SuccessMsg message={success} />}

        {loading ? (
          <p className="text-sm text-steel">Loading items…</p>
        ) : items.length === 0 ? (
          <EmptyState message="No items found. Run the SQL migration to seed items." />
        ) : (
          <div className="border border-mist overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Topic</th>
                  <th>Sub-Topic</th>
                  <th>Question</th>
                  <th>Correct</th>
                  <th>b-value</th>
                  <th>Difficulty</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td className="font-mono text-xs">{item.item_code}</td>
                    <td className="text-xs text-steel">{item.topic}</td>
                    <td className="text-xs">{item.sub_topic}</td>
                    <td className="max-w-xs truncate text-xs" title={item.question}>
                      {item.question}
                    </td>
                    <td className="font-mono text-xs font-bold">{item.correct_answer}</td>
                    <td className="font-mono text-xs">
                      {item.rasch_b_value >= 0 ? '+' : ''}{Number(item.rasch_b_value).toFixed(2)}
                    </td>
                    <td><DifficultyBadge level={item.difficulty_level} /></td>
                    <td>
                      <span
                        className={`badge ${
                          item.item_status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-mist text-steel'
                        }`}
                      >
                        {item.item_status}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setEditing(item); setError(''); setSuccess('') }}
                          className="text-xs text-ink underline underline-offset-2 hover:no-underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleStatus(item)}
                          className="text-xs text-steel hover:text-ink transition-colors"
                        >
                          {item.item_status === 'Active' ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Edit modal */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Item">
        {editing && (
          <div className="space-y-4">
            <div>
              <label className="input-label">Question</label>
              <textarea
                className="input-field min-h-[80px] resize-none"
                value={editing.question}
                onChange={e => setEditing({ ...editing, question: e.target.value })}
              />
            </div>
            {(['A','B','C','D'] as const).map(opt => (
              <div key={opt}>
                <label className="input-label">Option {opt}</label>
                <input
                  className="input-field"
                  value={(editing as any)[`option_${opt.toLowerCase()}`]}
                  onChange={e =>
                    setEditing({ ...editing, [`option_${opt.toLowerCase()}`]: e.target.value } as Item)
                  }
                />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="input-label">Correct Answer</label>
                <select
                  className="input-field"
                  value={editing.correct_answer}
                  onChange={e => setEditing({ ...editing, correct_answer: e.target.value as 'A'|'B'|'C'|'D' })}
                >
                  {['A','B','C','D'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="input-label">Rasch b-value</label>
                <input
                  type="number"
                  step="0.1"
                  className="input-field font-mono"
                  value={editing.rasch_b_value}
                  onChange={e => setEditing({ ...editing, rasch_b_value: parseFloat(e.target.value) })}
                />
              </div>
            </div>
            {error && <ErrorMsg message={error} />}
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setEditing(null)} className="btn-ghost text-sm">Cancel</button>
              <button onClick={handleSaveEdit} className="btn-primary text-sm">Save Changes</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
