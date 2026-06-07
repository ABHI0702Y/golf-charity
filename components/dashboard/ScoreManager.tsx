'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { Trash2, Plus } from 'lucide-react'
import type { GolfScore } from '@/types/database'

interface Props {
  initialScores: GolfScore[]
  userId: string
}

export default function ScoreManager({ initialScores, userId }: Props) {
  const [scores, setScores] = useState(initialScores)
  const [score, setScore] = useState('')
  const [playedAt, setPlayedAt] = useState('')
  const [adding, setAdding] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function addScore(e: React.FormEvent) {
    e.preventDefault()
    const num = parseInt(score)
    if (isNaN(num) || num < 1 || num > 45) {
      toast.error('Score must be between 1 and 45')
      return
    }
    if (!playedAt) {
      toast.error('Please select a date')
      return
    }
    setAdding(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('golf_scores')
      .insert({ user_id: userId, score: num, played_at: playedAt })
      .select()
      .single()

    if (error) {
      toast.error(error.message)
    } else {
      // Trigger auto-rollout by refreshing from DB
      const { data: fresh } = await supabase
        .from('golf_scores')
        .select('*')
        .eq('user_id', userId)
        .order('played_at', { ascending: false })
      setScores(fresh ?? [])
      setScore('')
      setPlayedAt('')
      toast.success('Score added!')
    }
    setAdding(false)
  }

  async function deleteScore(id: string) {
    setDeleting(id)
    const supabase = createClient()
    const { error } = await supabase.from('golf_scores').delete().eq('id', id)
    if (error) {
      toast.error(error.message)
    } else {
      setScores(prev => prev.filter(s => s.id !== id))
      toast.success('Score removed')
    }
    setDeleting(null)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Add score form */}
      <Card>
        <h2 className="font-bold mb-4">Add a score</h2>
        <form onSubmit={addScore} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              label="Stableford score (1–45)"
              type="number"
              min={1}
              max={45}
              placeholder="e.g. 34"
              value={score}
              onChange={e => setScore(e.target.value)}
              required
            />
          </div>
          <div className="flex-1">
            <Input
              label="Date played"
              type="date"
              value={playedAt}
              onChange={e => setPlayedAt(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              required
            />
          </div>
          <div className="flex items-end">
            <Button type="submit" loading={adding} className="whitespace-nowrap">
              <Plus size={16} /> Add score
            </Button>
          </div>
        </form>
      </Card>

      {/* Scores list */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold">Your scores</h2>
          <span className="text-sm text-[#6b7c6e]">{scores.length}/5 slots used</span>
        </div>

        {scores.length === 0 ? (
          <p className="text-center text-[#6b7c6e] py-8">No scores yet. Add your first Stableford score above.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {scores.map((s, i) => (
              <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-[#0a0f0d] border border-[#1e2d24]">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#4ade80]/10 flex items-center justify-center text-xs font-bold text-[#4ade80]">
                    #{i + 1}
                  </div>
                  <div>
                    <p className="font-bold text-lg">{s.score} <span className="text-xs text-[#6b7c6e] font-normal">points</span></p>
                    <p className="text-xs text-[#6b7c6e]">{format(new Date(s.played_at), 'd MMMM yyyy')}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  loading={deleting === s.id}
                  onClick={() => deleteScore(s.id)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            ))}
          </div>
        )}

        {scores.length >= 5 && (
          <p className="text-xs text-[#6b7c6e] mt-4 text-center">
            Maximum 5 scores. Adding a new score will automatically remove your oldest.
          </p>
        )}
      </Card>
    </div>
  )
}
