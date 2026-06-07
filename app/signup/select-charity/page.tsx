import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SelectCharityForm from './SelectCharityForm'

export default async function SelectCharityPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: charities } = await supabase
    .from('charities')
    .select('*')
    .order('featured', { ascending: false })
    .order('name')

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <p className="text-sm text-[#4ade80] font-medium mb-2">Step 2 of 3</p>
          <h1 className="text-3xl font-black mb-2">Choose your charity</h1>
          <p className="text-[#6b7c6e] text-sm">
            A minimum of 10% of your subscription goes directly to your chosen charity.
            You can change this anytime from your dashboard.
          </p>
        </div>
        <SelectCharityForm charities={charities ?? []} userId={user.id} />
      </div>
    </div>
  )
}
