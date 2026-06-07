'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'
import { Heart, Check } from 'lucide-react'
import type { Charity } from '@/types/database'

export default function SelectCharityForm({ charities, userId }: { charities: Charity[]; userId: string }) {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)
  const [percentage, setPercentage] = useState(10)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!selected) { toast.error('Please select a charity to continue'); return }
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({ charity_id: selected, charity_percentage: percentage })
      .eq('id', userId)
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success('Charity saved!')
    router.push('/subscribe')
  }

  async function handleSkip() {
    router.push('/subscribe')
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Contribution percentage */}
      <div className="glass rounded-2xl p-6">
        <h2 className="font-bold mb-4">Your contribution percentage</h2>
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="text-sm font-medium text-[#6b7c6e] block mb-1.5">
              How much of your subscription goes to charity?
            </label>
            <div className="relative">
              <input
                type="number"
                min={10}
                max={100}
                value={percentage}
                onChange={e => setPercentage(parseInt(e.target.value) || 10)}
                className="w-full px-4 py-2.5 bg-[#0a0f0d] border border-[#1e2d24] rounded-xl text-[#f0f4f1] pr-8 focus:outline-none focus:ring-2 focus:ring-[#4ade80]/50"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7c6e]">%</span>
            </div>
            <p className="text-xs text-[#6b7c6e] mt-1">Minimum 10%. You can increase this anytime.</p>
          </div>
          <div className="flex-1 bg-[#4ade80]/5 border border-[#4ade80]/20 rounded-xl p-4">
            <p className="text-xs text-[#6b7c6e] mb-1">Monthly charity contribution</p>
            <p className="text-2xl font-black text-[#4ade80]">
              £{((19.99 * Math.max(10, Math.min(100, percentage || 10))) / 100).toFixed(2)}
            </p>
            <p className="text-xs text-[#6b7c6e] mt-1">Based on monthly plan (£19.99)</p>
          </div>
        </div>
      </div>

      {/* Charity grid */}
      <div className="glass rounded-2xl p-6">
        <h2 className="font-bold mb-4">Select a charity</h2>
        {charities.length === 0 ? (
          <p className="text-[#6b7c6e] text-sm text-center py-6">
            No charities listed yet. You can select one from your dashboard after subscribing.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {charities.map(c => (
              <button
                key={c.id}
                type="button"
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
                      {c.featured && (
                        <span className="text-xs font-bold text-[#d4a017] block mb-0.5">★ Featured</span>
                      )}
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
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button size="lg" loading={saving} onClick={handleSave} className="flex-1">
          <Heart size={18} /> Save & Continue to Subscribe
        </Button>
        <Button size="lg" variant="outline" onClick={handleSkip}>
          Skip for now
        </Button>
      </div>
    </div>
  )
}
