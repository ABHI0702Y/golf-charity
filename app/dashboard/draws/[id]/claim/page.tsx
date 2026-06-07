import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import ClaimForm from '@/components/dashboard/ClaimForm'

export default async function ClaimPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Find the draw result where this user is a winner
  const { data: result } = await supabase
    .from('draw_results')
    .select('*, draws(month)')
    .eq('draw_id', id)
    .contains('user_ids', [user.id])
    .single()

  if (!result) notFound()

  // Check if already submitted
  const { data: existing } = await supabase
    .from('winner_verifications')
    .select('*')
    .eq('draw_result_id', result.id)
    .eq('user_id', user.id)
    .single()

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-black mb-2">Claim your prize</h1>
      <p className="text-[#6b7c6e] text-sm mb-6">
        Upload a screenshot of your scores from your golf platform to verify your win.
      </p>
      {existing ? (
        <div className="bg-[#4ade80]/5 border border-[#4ade80]/20 rounded-2xl p-6 text-center">
          <p className="font-bold mb-1">Claim already submitted</p>
          <p className="text-sm text-[#6b7c6e]">Status: <strong>{existing.admin_status}</strong></p>
        </div>
      ) : (
        <ClaimForm drawResultId={result.id} userId={user.id} prize={result.prize_per_winner} />
      )}
    </div>
  )
}
