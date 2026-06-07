import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ScoreManager from '@/components/dashboard/ScoreManager'

export default async function ScoresPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: scores } = await supabase
    .from('golf_scores')
    .select('*')
    .eq('user_id', user.id)
    .order('played_at', { ascending: false })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black">My Scores</h1>
        <p className="text-[#6b7c6e] text-sm mt-1">
          Your last 5 Stableford scores. A new score automatically replaces your oldest.
        </p>
      </div>
      <ScoreManager initialScores={scores ?? []} userId={user.id} />
    </div>
  )
}
