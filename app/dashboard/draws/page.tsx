import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Card, { CardHeader, CardTitle } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { formatPounds, formatMonth } from '@/lib/utils'

export default async function DrawsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get user's scores for matching
  const { data: myScores } = await supabase
    .from('golf_scores')
    .select('score')
    .eq('user_id', user.id)
  const myScoreNums = (myScores ?? []).map(s => s.score)

  // Get all published draws with results
  const { data: draws } = await supabase
    .from('draws')
    .select('*, draw_results(*)')
    .eq('status', 'published')
    .order('month', { ascending: false })

  // Get my verifications
  const { data: verifications } = await supabase
    .from('winner_verifications')
    .select('*, draw_results(draw_id, match_type, prize_per_winner)')
    .eq('user_id', user.id)

  const verificationMap = new Map(
    (verifications ?? []).map(v => [v.draw_results?.draw_id, v])
  )

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-black">Monthly Draws</h1>
        <p className="text-[#6b7c6e] text-sm mt-1">Published draw results and your participation history</p>
      </div>

      {/* Current scores box */}
      <Card>
        <CardHeader>
          <CardTitle>Your current numbers</CardTitle>
        </CardHeader>
        {myScoreNums.length > 0 ? (
          <div className="flex gap-2 flex-wrap">
            {myScoreNums.map((n, i) => (
              <div key={i} className="w-12 h-12 rounded-xl bg-[#4ade80]/10 border border-[#4ade80]/20 flex items-center justify-center font-bold text-[#4ade80]">
                {n}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[#6b7c6e] text-sm">Add your golf scores to participate in draws.</p>
        )}
      </Card>

      {/* Draws list */}
      {draws && draws.length > 0 ? (
        draws.map(draw => {
          const matchCount = draw.drawn_numbers
            ? myScoreNums.filter(s => draw.drawn_numbers.includes(s)).length
            : 0
          const myVerification = verificationMap.get(draw.id)
          const isWinner = draw.draw_results?.some((r: { user_ids: string[] }) => r.user_ids?.includes(user.id))

          return (
            <Card key={draw.id}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold text-lg">{formatMonth(draw.month)}</h2>
                  <p className="text-xs text-[#6b7c6e]">Prize pool: {formatPounds(draw.total_pool)}</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="published">Published</Badge>
                  {isWinner && <Badge variant="active">Winner!</Badge>}
                </div>
              </div>

              {/* Drawn numbers */}
              <div className="mb-4">
                <p className="text-xs text-[#6b7c6e] mb-2">Drawn numbers</p>
                <div className="flex gap-2 flex-wrap">
                  {draw.drawn_numbers.map((n: number) => {
                    const isMatch = myScoreNums.includes(n)
                    return (
                      <div key={n} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                        isMatch ? 'bg-[#4ade80] text-[#0a0f0d]' : 'bg-[#1e2d24] text-[#f0f4f1]'
                      }`}>
                        {n}
                      </div>
                    )
                  })}
                </div>
                {myScoreNums.length > 0 && (
                  <p className="text-xs mt-2 text-[#6b7c6e]">
                    You matched <strong className="text-[#4ade80]">{matchCount}</strong> number{matchCount !== 1 ? 's' : ''}
                  </p>
                )}
              </div>

              {/* Prize tiers */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {draw.draw_results.map((r: { id: string; match_type: number; user_ids: string[]; prize_per_winner: number }) => (
                  <div key={r.id} className={`p-3 rounded-xl border text-center ${
                    r.user_ids?.includes(user.id) ? 'border-[#4ade80] bg-[#4ade80]/5' : 'border-[#1e2d24]'
                  }`}>
                    <p className="text-xs text-[#6b7c6e]">{r.match_type}-match</p>
                    <p className="font-bold">{formatPounds(r.prize_per_winner)}</p>
                    <p className="text-xs text-[#6b7c6e]">{r.user_ids?.length ?? 0} winner{(r.user_ids?.length ?? 0) !== 1 ? 's' : ''}</p>
                  </div>
                ))}
              </div>

              {/* Winner claim status */}
              {isWinner && (
                <div className="bg-[#4ade80]/5 border border-[#4ade80]/20 rounded-xl p-4">
                  {myVerification ? (
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Claim status</p>
                      <div className="flex gap-2">
                        <Badge variant={myVerification.admin_status as 'pending' | 'approved' | 'rejected'}>
                          {myVerification.admin_status}
                        </Badge>
                        <Badge variant={myVerification.payment_status as 'pending' | 'paid'}>
                          {myVerification.payment_status}
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <a href={`/dashboard/draws/${draw.id}/claim`}
                      className="text-sm font-medium text-[#4ade80] hover:underline">
                      🎉 You won! Submit your proof to claim →
                    </a>
                  )}
                </div>
              )}
            </Card>
          )
        })
      ) : (
        <Card>
          <p className="text-center text-[#6b7c6e] py-8">No published draws yet. Check back at the end of the month.</p>
        </Card>
      )}
    </div>
  )
}
