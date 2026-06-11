import { stripe } from '@/lib/stripe'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import Stripe from 'stripe'

export default async function SubscribeSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const { session_id } = await searchParams

  if (session_id) {
    try {
      // Get current logged-in user
      const supabaseUser = await createClient()
      const { data: { user } } = await supabaseUser.auth.getUser()

      const session = await stripe.checkout.sessions.retrieve(session_id, {
        expand: ['subscription'],
      })

      const sub = session.subscription as Stripe.Subscription | null
      const userId = user?.id ?? session.metadata?.user_id ?? sub?.metadata?.user_id
      const plan = session.metadata?.plan ?? sub?.metadata?.plan ?? 'monthly'

      if (sub && userId) {
        const supabase = await createAdminClient()
        const item = sub.items?.data?.[0]
        await supabase.from('subscriptions').upsert({
          user_id: userId,
          stripe_subscription_id: sub.id,
          plan,
          status: 'active',
          current_period_start: item?.current_period_start
            ? new Date(item.current_period_start * 1000).toISOString()
            : null,
          current_period_end: item?.current_period_end
            ? new Date(item.current_period_end * 1000).toISOString()
            : null,
          cancel_at_period_end: sub.cancel_at_period_end,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'stripe_subscription_id' })
      }
    } catch {
      // Webhook will handle it if this fails
    }
  }

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-[#4ade80]/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-[#4ade80]" />
        </div>
        <h1 className="text-3xl font-black mb-3">You&apos;re in!</h1>
        <p className="text-[#6b7c6e] mb-8">
          Your subscription is active. Head to your dashboard to enter your golf scores and choose your charity.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0a0f0d] bg-[#4ade80] text-[#0a0f0d] hover:bg-[#22c55e] focus:ring-[#4ade80] px-7 py-3.5 text-base"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  )
}
