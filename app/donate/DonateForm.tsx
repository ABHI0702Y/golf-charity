'use client'
import { useState } from 'react'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'
import { Heart } from 'lucide-react'

interface Charity {
  id: string
  name: string
  description: string | null
}

const PRESET_AMOUNTS = [
  { label: '£5', pence: 500 },
  { label: '£10', pence: 1000 },
  { label: '£25', pence: 2500 },
  { label: '£50', pence: 5000 },
]

export default function DonateForm({ charities }: { charities: Charity[] }) {
  const [selectedCharity, setSelectedCharity] = useState<string>('')
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const effectiveAmount = selectedAmount ?? (customAmount ? Math.round(parseFloat(customAmount) * 100) : null)
  const displayAmount = effectiveAmount ? `£${(effectiveAmount / 100).toFixed(2)}` : ''

  async function handleDonate() {
    if (!selectedCharity) {
      toast.error('Please select a charity')
      return
    }
    if (!effectiveAmount || effectiveAmount < 100) {
      toast.error('Minimum donation is £1')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/stripe/donate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ charity_id: selectedCharity, amount_pence: effectiveAmount }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error(data.error ?? 'Something went wrong')
      }
    } catch {
      toast.error('Failed to process donation')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass rounded-2xl p-8 space-y-8">
      {/* Charity selection */}
      <div>
        <label className="block text-sm font-semibold mb-3 text-[#f0f4f1]">
          Choose a charity
        </label>
        <div className="flex flex-col gap-3">
          {charities.map(c => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedCharity(c.id)}
              className={`flex items-start gap-4 p-4 rounded-xl border text-left transition-all ${
                selectedCharity === c.id
                  ? 'border-[#4ade80] bg-[#4ade80]/10'
                  : 'border-[#1e2d24] hover:border-[#4ade80]/40 bg-[#111816]'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-[#4ade80]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Heart size={16} className="text-[#4ade80]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#f0f4f1]">{c.name}</p>
                {c.description && (
                  <p className="text-xs text-[#6b7c6e] mt-0.5 line-clamp-2">{c.description}</p>
                )}
              </div>
              {selectedCharity === c.id && (
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-5 h-5 rounded-full bg-[#4ade80] flex items-center justify-center">
                    <svg className="w-3 h-3 text-[#0a0f0d]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Amount selection */}
      <div>
        <label className="block text-sm font-semibold mb-3 text-[#f0f4f1]">
          Choose an amount
        </label>
        <div className="grid grid-cols-4 gap-3 mb-4">
          {PRESET_AMOUNTS.map(({ label, pence }) => (
            <button
              key={pence}
              type="button"
              onClick={() => { setSelectedAmount(pence); setCustomAmount('') }}
              className={`py-3 rounded-xl border font-bold transition-all text-sm ${
                selectedAmount === pence
                  ? 'border-[#4ade80] bg-[#4ade80] text-[#0a0f0d]'
                  : 'border-[#1e2d24] bg-[#111816] text-[#f0f4f1] hover:border-[#4ade80]/50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7c6e] font-semibold select-none">£</span>
          <input
            type="number"
            min="1"
            step="0.01"
            placeholder="Other amount"
            value={customAmount}
            onChange={e => { setCustomAmount(e.target.value); setSelectedAmount(null) }}
            className="w-full pl-8 pr-4 py-3 bg-[#111816] border border-[#1e2d24] rounded-xl text-[#f0f4f1] placeholder-[#6b7c6e] focus:outline-none focus:ring-2 focus:ring-[#4ade80]/50 focus:border-[#4ade80] transition-colors"
          />
        </div>
      </div>

      <Button
        size="lg"
        className="w-full"
        loading={loading}
        onClick={handleDonate}
        disabled={!selectedCharity || !effectiveAmount || effectiveAmount < 100}
      >
        {displayAmount ? `Donate ${displayAmount}` : 'Donate'}
      </Button>

      <p className="text-center text-xs text-[#6b7c6e]">
        Secured by Stripe. You&apos;ll receive a receipt by email.
      </p>
    </div>
  )
}
