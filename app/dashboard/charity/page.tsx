import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CharitySelector from '@/components/dashboard/CharitySelector'

export default async function CharityPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: charities }] = await Promise.all([
    supabase.from('profiles').select('charity_id, charity_percentage').eq('id', user.id).single(),
    supabase.from('charities').select('*').order('name'),
  ])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black">My Charity</h1>
        <p className="text-[#6b7c6e] text-sm mt-1">
          Choose who your subscription supports. Minimum 10% of your fee goes directly to them.
        </p>
      </div>
      <CharitySelector
        charities={charities ?? []}
        currentCharityId={profile?.charity_id ?? null}
        currentPercentage={profile?.charity_percentage ?? 10}
        userId={user.id}
      />
    </div>
  )
}
