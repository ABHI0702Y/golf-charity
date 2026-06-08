import { createClient } from '@/lib/supabase/server'
import DonateForm from './DonateForm'

export const metadata = {
  title: 'Donate – GolfGives',
  description: 'Make a one-time donation to a charity of your choice.',
}

export default async function DonatePage() {
  const supabase = await createClient()
  const { data: charities } = await supabase
    .from('charities')
    .select('id, name, description')
    .order('featured', { ascending: false })
    .order('name')

  return (
    <div className="min-h-screen hero-gradient py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">💚</div>
          <h1 className="text-4xl font-black mb-3">Make a Donation</h1>
          <p className="text-[#6b7c6e] max-w-md mx-auto">
            Support a cause directly — no subscription needed. 100% of your donation goes to the charity.
          </p>
        </div>
        <DonateForm charities={charities ?? []} />
      </div>
    </div>
  )
}
