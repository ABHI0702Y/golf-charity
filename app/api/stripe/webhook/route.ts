import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { getAdminClient } from '@/lib/supabase/admin'
import { sendSubscriptionEmail } from '@/lib/email'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  const db = getAdminClient()
  const sub = event.data.object as Stripe.Subscription

  async function upsertSubscription(stripeSubscription: Stripe.Subscription, status: string) {
    const userId = stripeSubscription.metadata?.user_id
    if (!userId) return

    const plan = stripeSubscription.metadata?.plan ?? 'monthly'
    const item = stripeSubscription.items?.data?.[0]

    await db.from('subscriptions').upsert({
      user_id: userId,
      stripe_subscription_id: stripeSubscription.id,
      plan,
      status,
      current_period_start: item?.current_period_start
        ? new Date(item.current_period_start * 1000).toISOString()
        : null,
      current_period_end: item?.current_period_end
        ? new Date(item.current_period_end * 1000).toISOString()
        : null,
      cancel_at_period_end: stripeSubscription.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'stripe_subscription_id' })

    const { data: { user } } = await db.auth.admin.getUserById(userId)
    return { userId, email: user?.email }
  }

  switch (event.type) {
    case 'customer.subscription.created': {
      const result = await upsertSubscription(sub, 'active')
      if (result?.email) {
        await sendSubscriptionEmail(result.email, '', 'welcome').catch(console.error)
      }
      break
    }

    case 'customer.subscription.updated': {
      const status = sub.status === 'active' ? 'active' : 'lapsed'
      const result = await upsertSubscription(sub, status)
      if (result?.email && sub.status === 'active') {
        await sendSubscriptionEmail(result.email, '', 'renewed').catch(console.error)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const userId = sub.metadata?.user_id
      if (userId) {
        await db
          .from('subscriptions')
          .update({ status: 'cancelled', updated_at: new Date().toISOString() })
          .eq('stripe_subscription_id', sub.id)
        const { data: { user } } = await db.auth.admin.getUserById(userId)
        if (user?.email) {
          await sendSubscriptionEmail(user.email, '', 'cancelled').catch(console.error)
        }
      }
      break
    }

    case 'invoice.payment_failed': {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const invoice = event.data.object as any
      const stripeSubId = invoice.subscription as string
      if (stripeSubId) {
        await db
          .from('subscriptions')
          .update({ status: 'lapsed', updated_at: new Date().toISOString() })
          .eq('stripe_subscription_id', stripeSubId)

        const { data: subRecord } = await db
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', stripeSubId)
          .single()
        if (subRecord?.user_id) {
          const { data: { user } } = await db.auth.admin.getUserById(subRecord.user_id)
          if (user?.email) {
            await sendSubscriptionEmail(user.email, '', 'lapsed').catch(console.error)
          }
        }
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
