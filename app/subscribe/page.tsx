import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
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

    if (sub) redirect('/dashboard')
  }

  return <SubscribePlans />
}
