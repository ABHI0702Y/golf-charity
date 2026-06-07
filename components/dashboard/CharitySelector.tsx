'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'
import { Heart, Check } from 'lucide-react'
import type { Charity } from '@/types/database'

interface Props {
  charities: Charity[]
  currentCharityId: string | null
  currentPercentage: number
  userId: string
}

export default function CharitySelector({ charities, currentCharityId, currentPercentage, userId }: Props) {
  const [selected, setSelected] = useState(currentCharityId)
  const [percentage, setPercentage] = useState(currentPercentage)
  const [saving, setSaving] = useState(false)

  async function save() {
    if (!selected) { toast.error('Please select a charity'); return }
    if (percentage < 10 || percentage > 100) { toast.error('Percentage must be between 10% and 100%'); return }
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({ charity_id: selected, charity_percentage: percentage })
      .eq('id', userId)
    setSaving(false)
    if (error) toast.error(error.message)
    else toast.success('Charity preference saved!')
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <h2 className="font-bold mb-4">Your contribution</h2>
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="text-sm font-medium text-[#6b7c6e] block mb-1.5">
              Charity contribution percentage
            </label>
            <div className="relative">
              <input
                type="number"
                min={10}
                max={100}
                value={percentage}
                onChange={e => setPercentage(parseInt(e.target.value))}
                className="w-full px-4 py-2.5 bg-[#0a0f0d] border border-[#1e2d24] rounded-xl text-[#f0f4f1] pr-8 focus:outline-none focus:ring-2 focus:ring-[#4ade80]/50"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7c6e]">%</span>
            </div>
            <p className="text-xs text-[#6b7c6e] mt-1">Minimum 10%. Donate more to increase your impact.</p>
          </div>
          <div className="flex-1 bg-[#4ade80]/5 border border-[#4ade80]/20 rounded-xl p-4">
            <p className="text-xs text-[#6b7c6e] mb-1">Monthly contribution estimate</p>
            <p className="text-2xl font-black text-[#4ade80]">
              £{((19.99 * percentage) / 100).toFixed(2)}
            </p>
            <p className="text-xs text-[#6b7c6e] mt-1">Based on monthly plan (£19.99)</p>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="font-bold mb-4">Choose your charity</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {charities.map(c => (
            <button
              key={c.id}
              onClick={() => setSelected(c.id)}
              className={`text-left p-4 rounded-xl border transition-all ${
                selected === c.id
                  ? 'border-[#4ade80] bg-[#4ade80]/5'
                  : 'border-[#1e2d24] hover:border-[#4ade80]/30 hover:bg-[#111816]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#4ade80]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Heart size={14} className="text-[#4ade80]" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{c.name}</p>
                    <p className="text-xs text-[#6b7c6e] line-clamp-2 mt-1">{c.description}</p>
                  </div>
                </div>
                {selected === c.id && (
                  <div className="w-5 h-5 rounded-full bg-[#4ade80] flex items-center justify-center flex-shrink-0">
                    <Check size={12} className="text-[#0a0f0d]" />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </Card>

      <Button size="lg" loading={saving} onClick={save} className="self-start">
        Save charity preference
      </Button>
    </div>
  )
}
