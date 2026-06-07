'use client'
import { useState } from 'react'
import Card, { CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { formatPounds, formatMonth } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { Draw } from '@/types/database'

interface Props {
  currentMonth: string
  currentDraw: Draw | null
  activeSubscribers: number
  jackpotRollover: number
}

export default function DrawEngine({ currentMonth, currentDraw, activeSubscribers, jackpotRollover }: Props) {
  const [draw, setDraw] = useState(currentDraw)
  const [drawType, setDrawType] = useState<'random' | 'algorithmic'>('random')
  const [loading, setLoading] = useState<string | null>(null)

  const pricePerMonth = 1999 // pence
  const poolPerSub = pricePerMonth * 0.60 / 100 // £ contribution per subscriber
  const totalPool = activeSubscribers * poolPerSub + jackpotRollover

  async function runAction(action: 'simulate' | 'publish') {
    setLoading(action)
    const res = await fetch('/api/admin/draws', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, month: currentMonth, drawType }),
    })
    const data = await res.json()
    setLoading(null)
    if (data.error) toast.error(data.error)
    else {
      setDraw(data.draw)
      toast.success(action === 'simulate' ? 'Simulation complete!' : 'Draw published!')
    }
  }

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Current draw — {formatMonth(currentMonth)}</CardTitle>
        {draw && <Badge variant={draw.status as 'draft' | 'published'}>{draw.status}</Badge>}
      </CardHeader>

      <div className="grid sm:grid-cols-3 gap-4 mb-6 text-sm">
        <div className="p-3 rounded-xl bg-[#0a0f0d] border border-[#1e2d24]">
          <p className="text-xs text-[#6b7c6e]">Active subscribers</p>
          <p className="text-xl font-bold mt-1">{activeSubscribers}</p>
        </div>
        <div className="p-3 rounded-xl bg-[#0a0f0d] border border-[#1e2d24]">
          <p className="text-xs text-[#6b7c6e]">Jackpot rollover</p>
          <p className="text-xl font-bold mt-1 text-[#d4a017]">{formatPounds(jackpotRollover)}</p>
        </div>
        <div className="p-3 rounded-xl bg-[#0a0f0d] border border-[#1e2d24]">
          <p className="text-xs text-[#6b7c6e]">Estimated pool</p>
          <p className="text-xl font-bold mt-1 text-[#4ade80]">{formatPounds(totalPool)}</p>
        </div>
      </div>

      {/* Draw type */}
      <div className="mb-6">
        <label className="text-sm font-medium text-[#6b7c6e] block mb-2">Draw algorithm</label>
        <div className="flex gap-3">
          {(['random', 'algorithmic'] as const).map(t => (
            <button
              key={t}
              onClick={() => setDrawType(t)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all capitalize ${
                drawType === t ? 'border-[#4ade80] bg-[#4ade80]/5 text-[#4ade80]' : 'border-[#1e2d24] text-[#6b7c6e]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <p className="text-xs text-[#6b7c6e] mt-1">
          Random: standard lottery. Algorithmic: weighted by score frequency.
        </p>
      </div>

      {/* Simulated numbers preview */}
      {draw && draw.drawn_numbers.length > 0 && (
        <div className="mb-6">
          <p className="text-sm font-medium mb-3">{draw.status === 'published' ? 'Published numbers' : 'Simulated numbers (preview)'}</p>
          <div className="flex gap-2">
            {draw.drawn_numbers.map(n => (
              <div key={n} className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                draw.status === 'published' ? 'bg-[#4ade80] text-[#0a0f0d]' : 'bg-[#d4a017]/20 text-[#d4a017] border border-[#d4a017]/30'
              }`}>
                {n}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Button
          variant="secondary"
          loading={loading === 'simulate'}
          disabled={draw?.status === 'published'}
          onClick={() => runAction('simulate')}
        >
          Run simulation
        </Button>
        <Button
          loading={loading === 'publish'}
          disabled={draw?.status === 'published' || !draw?.drawn_numbers?.length}
          onClick={() => runAction('publish')}
        >
          Publish draw
        </Button>
      </div>

      {draw?.status === 'published' && (
        <p className="text-xs text-[#6b7c6e] mt-3">This draw has been published and results sent to winners.</p>
      )}
    </Card>
  )
}
