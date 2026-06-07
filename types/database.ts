export type UserRole = 'subscriber' | 'admin'
export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'lapsed'
export type SubscriptionPlan = 'monthly' | 'yearly'
export type DrawStatus = 'draft' | 'simulated' | 'published'
export type DrawType = 'random' | 'algorithmic'
export type MatchType = 3 | 4 | 5
export type AdminStatus = 'pending' | 'approved' | 'rejected'
export type PaymentStatus = 'pending' | 'paid'

export interface Profile {
  id: string
  full_name: string | null
  role: UserRole
  charity_id: string | null
  charity_percentage: number
  stripe_customer_id: string | null
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  stripe_subscription_id: string | null
  plan: SubscriptionPlan
  status: SubscriptionStatus
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  created_at: string
  updated_at: string
}

export interface GolfScore {
  id: string
  user_id: string
  score: number
  played_at: string
  created_at: string
}

export interface Charity {
  id: string
  name: string
  description: string | null
  images: string[]
  featured: boolean
  website: string | null
  created_at: string
}

export interface Draw {
  id: string
  month: string
  status: DrawStatus
  draw_type: DrawType
  drawn_numbers: number[]
  jackpot_rollover: number
  total_pool: number
  active_subscribers: number
  published_at: string | null
  created_at: string
}

export interface DrawResult {
  id: string
  draw_id: string
  match_type: MatchType
  user_ids: string[]
  prize_pool: number
  prize_per_winner: number
  created_at: string
}

export interface WinnerVerification {
  id: string
  draw_result_id: string
  user_id: string
  proof_url: string | null
  admin_status: AdminStatus
  payment_status: PaymentStatus
  admin_note: string | null
  submitted_at: string
  reviewed_at: string | null
}

export interface CharityDonation {
  id: string
  user_id: string
  charity_id: string
  amount: number
  stripe_payment_intent_id: string | null
  status: string
  created_at: string
}

// Joined types
export interface ProfileWithSubscription extends Profile {
  subscriptions: Subscription[]
}

export interface DrawWithResults extends Draw {
  draw_results: DrawResult[]
}

export interface WinnerVerificationWithDetails extends WinnerVerification {
  profiles: Profile
  draw_results: DrawResult & { draws: Draw }
}
