import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Button from '@/components/ui/Button'

export default async function DonateSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const { session_id } = await searchParams

  if (!session_id) return <ErrorState />

  let session
  try {
    session = await stripe.checkout.sessions.retrieve(session_id)
  } catch {
    return <ErrorState />
  }

  if (session.payment_status !== 'paid') return <ErrorState />

  const { charity_id, user_id } = session.metadata ?? {}
  const paymentIntentId = typeof session.payment_intent === 'string'
    ? session.payment_intent
    : session.payment_intent?.id ?? null

  // Record in DB (idempotent — skip if already exists)
  if (charity_id && paymentIntentId) {
    const supabase = await createAdminClient()
    const { data: existing } = await supabase
      .from('charity_donations')
      .select('id')
      .eq('stripe_payment_intent_id', paymentIntentId)
      .maybeSingle()

    if (!existing) {
      await supabase.from('charity_donations').insert({
        charity_id,
        user_id: user_id || null,
        amount: session.amount_total ?? 0,
        stripe_payment_intent_id: paymentIntentId,
        status: 'paid',
      })
    }
  }

  // Get charity name for display
  let charityName = 'your chosen charity'
  if (charity_id) {
    const supabase = await createAdminClient()
    const { data } = await supabase.from('charities').select('name').eq('id', charity_id).single()
    if (data) charityName = data.name
  }

  const amountGbp = ((session.amount_total ?? 0) / 100).toFixed(2)

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">💚</div>
        <h1 className="text-3xl font-black mb-3">Thank you!</h1>
        <p className="text-[#6b7c6e] mb-2">
          Your donation of{' '}
          <span className="text-[#f0f4f1] font-semibold">£{amountGbp}</span>{' '}
          to{' '}
          <span className="text-[#4ade80] font-semibold">{charityName}</span>{' '}
          has been received.
        </p>
        <p className="text-sm text-[#6b7c6e] mb-8">
          A receipt has been sent to your email address.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/donate">
            <Button variant="outline" size="lg">Donate Again</Button>
          </Link>
          <Link href="/">
            <Button size="lg">Back to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

function ErrorState() {
  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-6">⚠️</div>
        <h1 className="text-2xl font-black mb-3">Payment not confirmed</h1>
        <p className="text-[#6b7c6e] mb-8">
          We couldn&apos;t verify your donation. If you were charged, please contact support.
        </p>
        <Link href="/donate">
          <Button size="lg">Try Again</Button>
        </Link>
      </div>
    </div>
  )
}
