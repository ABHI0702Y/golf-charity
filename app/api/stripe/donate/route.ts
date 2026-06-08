import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { charity_id, amount_pence } = await req.json()

    if (!charity_id || typeof amount_pence !== 'number' || amount_pence < 100) {
      return NextResponse.json({ error: 'Invalid request. Minimum donation is £1.' }, { status: 400 })
    }

    const { data: charity } = await supabase
      .from('charities')
      .select('id, name')
      .eq('id', charity_id)
      .single()

    if (!charity) {
      return NextResponse.json({ error: 'Charity not found' }, { status: 404 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    type SessionCreateParams = Parameters<typeof stripe.checkout.sessions.create>[0]
    const sessionConfig: SessionCreateParams = {
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'gbp',
          product_data: {
            name: `Donation to ${charity.name}`,
            description: 'One-time charitable donation via GolfGives',
          },
          unit_amount: amount_pence,
        },
        quantity: 1,
      }],
      success_url: `${appUrl}/donate/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/donate`,
      metadata: {
        charity_id,
        amount_pence: String(amount_pence),
        user_id: user?.id ?? '',
        source: 'donation',
      },
    }

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('stripe_customer_id')
        .eq('id', user.id)
        .single()

      if (profile?.stripe_customer_id) {
        sessionConfig.customer = profile.stripe_customer_id
      } else {
        sessionConfig.customer_email = user.email ?? undefined
      }
    }

    const session = await stripe.checkout.sessions.create(sessionConfig)
    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Donate error:', err)
    return NextResponse.json({ error: 'Failed to create donation session' }, { status: 500 })
  }
}
