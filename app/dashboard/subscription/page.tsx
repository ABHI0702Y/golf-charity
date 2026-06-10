import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'
import Link from 'next/link'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import ManageSubscriptionButton from '@/components/dashboard/ManageSubscriptionButton'

export default async function SubscriptionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-black">Subscription</h1>
        <p className="text-[#6b7c6e] text-sm mt-1">Manage your billing and plan</p>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold">Current plan</h2>
          <Badge variant={sub?.status === 'active' ? 'active' : 'inactive'}>
            {sub?.status ?? 'none'}
          </Badge>
        </div>

        {sub ? (
          <dl className="flex flex-col gap-4">
            <div className="flex justify-between">
              <dt className="text-sm text-[#6b7c6e]">Plan</dt>
              <dd className="text-sm font-medium capitalize">{sub.plan}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-[#6b7c6e]">Status</dt>
              <dd className="text-sm font-medium capitalize">{sub.status}</dd>
            </div>
            {sub.current_period_start && (
              <div className="flex justify-between">
                <dt className="text-sm text-[#6b7c6e]">Period start</dt>
                <dd className="text-sm">{format(new Date(sub.current_period_start), 'd MMM yyyy')}</dd>
              </div>
            )}
            {sub.current_period_end && (
              <div className="flex justify-between">
                <dt className="text-sm text-[#6b7c6e]">
                  {sub.cancel_at_period_end ? 'Access until' : 'Next renewal'}
                </dt>
                <dd className="text-sm">{format(new Date(sub.current_period_end), 'd MMM yyyy')}</dd>
              </div>
            )}
            {sub.cancel_at_period_end && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
                <p className="text-sm text-yellow-400">
                  Your subscription is set to cancel at the end of the current period.
                </p>
              </div>
            )}
          </dl>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-[#6b7c6e] text-sm">No active subscription.</p>
            <Link href="/subscribe">
              <Button size="lg" className="w-full">Choose a plan</Button>
            </Link>
          </div>
        )}

        {sub && (
          <div className="mt-6 pt-6 border-t border-[#1e2d24]">
            <ManageSubscriptionButton />
          </div>
        )}
      </Card>
    </div>
  )
}
