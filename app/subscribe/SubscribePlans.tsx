'use client'
import { useState } from 'react'
import Button from '@/components/ui/Button'
import { Check, Zap } from 'lucide-react'
import toast from 'react-hot-toast'

const PLANS = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: '£19.99',
    per: '/month',
    description: 'Flexible month-to-month membership',
    features: [
      'Monthly prize draw entry',
      '5 rolling Stableford scores',
      'Charity contribution (min 10%)',
      'Cancel anytime',
    ],
    highlight: false,
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: '£199.99',
    per: '/year',
    description: 'Best value — save over 16%',
    features: [
      'Everything in Monthly',
      '12 months for the price of 10',
      'Priority draw entry',
      'Early access to features',
    ],
    highlight: true,
  },
]

export default function SubscribePlans() {
  const [loading, setLoading] = useState<string | null>(null)

  async function handleSubscribe(plan: string) {
    setLoading(plan)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.assign(data.url)
      } else {
        toast.error(data.error || 'Failed to create checkout session')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen hero-gradient flex flex-col items-center justify-center px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-black mb-3">
          Choose your <span className="gradient-text">plan</span>
        </h1>
        <p className="text-[#6b7c6e] max-w-md mx-auto">
          Every subscription enters you in the monthly draw and supports your chosen charity.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 w-full max-w-2xl">
        {PLANS.map(plan => (
          <div
            key={plan.id}
            className={`rounded-2xl p-8 border transition-all ${
              plan.highlight
                ? 'border-[#4ade80] bg-[#4ade80]/5 shadow-xl shadow-[#4ade80]/10'
                : 'border-[#1e2d24] bg-[#111816]'
            }`}
          >
            {plan.highlight && (
              <div className="flex items-center gap-1 text-xs font-bold text-[#4ade80] mb-4 uppercase tracking-widest">
                <Zap size={12} fill="currentColor" /> Most popular
              </div>
            )}
            <h2 className="text-2xl font-black mb-1">{plan.name}</h2>
            <p className="text-[#6b7c6e] text-sm mb-4">{plan.description}</p>
            <div className="flex items-end gap-1 mb-6">
              <span className="text-4xl font-black">{plan.price}</span>
              <span className="text-[#6b7c6e] mb-1">{plan.per}</span>
            </div>

            <ul className="flex flex-col gap-3 mb-8">
              {plan.features.map(f => (
                <li key={f} className="flex items-center gap-3 text-sm">
                  <div className="w-5 h-5 rounded-full bg-[#4ade80]/20 flex items-center justify-center flex-shrink-0">
                    <Check size={12} className="text-[#4ade80]" />
                  </div>
                  {f}
                </li>
              ))}
            </ul>

            <Button
              size="lg"
              variant={plan.highlight ? 'primary' : 'outline'}
              className="w-full"
              loading={loading === plan.id}
              onClick={() => handleSubscribe(plan.id)}
            >
              Subscribe {plan.name.toLowerCase()}
            </Button>
          </div>
        ))}
      </div>

      <p className="text-xs text-[#6b7c6e] mt-8 text-center max-w-sm">
        Secure payment via Stripe. Cancel anytime. Minimum 10% of your subscription is donated to your chosen charity.
      </p>
    </div>
  )
}
