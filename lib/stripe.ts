import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-05-27.dahlia',
})

export const PLANS = {
  monthly: {
    name: 'Monthly',
    price: 1999, // £19.99 in pence
    interval: 'month' as const,
    priceId: process.env.STRIPE_MONTHLY_PRICE_ID!,
  },
  yearly: {
    name: 'Yearly',
    price: 19999, // £199.99 in pence
    interval: 'year' as const,
    priceId: process.env.STRIPE_YEARLY_PRICE_ID!,
  },
}

// Fixed portion of subscription going to prize pool (60%)
export const PRIZE_POOL_PERCENTAGE = 0.60

// Prize pool split
export const PRIZE_SPLITS = {
  5: 0.40, // jackpot
  4: 0.35,
  3: 0.25,
}

// Minimum charity percentage
export const MIN_CHARITY_PERCENTAGE = 0.10
