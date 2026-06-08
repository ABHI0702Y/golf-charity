import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import SubscribePlans from './SubscribePlans'

export default async function SubscribePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .limit(1)
      .maybeSingle()

    if (sub) {
      return (
        <div className="min-h-screen hero-gradient flex flex-col items-center justify-center px-4 py-16">
          <div className="text-center max-w-md">
            <div className="text-5xl mb-6">⛳</div>
            <h1 className="text-3xl font-black mb-3">You&apos;re already subscribed!</h1>
            <p className="text-[#6b7c6e] mb-8">
              Your subscription is active. Head to your dashboard to enter scores and view draw results.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/dashboard">
                <Button size="lg">Go to Dashboard</Button>
              </Link>
              <Link href="/dashboard/subscription">
                <Button size="lg" variant="outline">Manage Subscription</Button>
              </Link>
            </div>
          </div>
        </div>
      )
    }
  }

  return <SubscribePlans />
}
