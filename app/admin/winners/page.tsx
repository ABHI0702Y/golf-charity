import { createClient } from '@/lib/supabase/server'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { formatPounds, formatMonth } from '@/lib/utils'
import { format } from 'date-fns'
import WinnerActions from '@/components/admin/WinnerActions'

export default async function AdminWinnersPage() {
  const supabase = await createClient()

  const { data: verifications } = await supabase
    .from('winner_verifications')
    .select(`
      *,
      profiles(full_name),
      draw_results(match_type, prize_per_winner, draws(month))
    `)
    .order('submitted_at', { ascending: false })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-black">Winner Verification</h1>
        <p className="text-[#6b7c6e] text-sm mt-1">Review and approve prize claims</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {['all', 'pending', 'approved', 'rejected'].map(filter => (
          <span key={filter} className="px-3 py-1 rounded-full text-xs font-medium bg-[#111816] border border-[#1e2d24] text-[#6b7c6e] capitalize cursor-default">
            {filter} ({verifications?.filter(v => filter === 'all' || v.admin_status === filter).length ?? 0})
          </span>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {verifications?.length ? verifications.map(v => {
          const profile = v.profiles as { full_name: string } | null
          const result = v.draw_results as { match_type: number; prize_per_winner: number; draws?: { month: string } } | null

          return (
            <Card key={v.id}>
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-bold">{profile?.full_name ?? 'Unknown'}</p>
                    <Badge variant={v.admin_status as 'pending' | 'approved' | 'rejected'}>{v.admin_status}</Badge>
                    <Badge variant={v.payment_status as 'pending' | 'paid'}>{v.payment_status}</Badge>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-[#6b7c6e]">Draw</p>
                      <p className="font-medium">{result?.draws?.month ? formatMonth(result.draws.month) : '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#6b7c6e]">Match type</p>
                      <p className="font-medium">{result?.match_type}-number match</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#6b7c6e]">Prize</p>
                      <p className="font-medium text-[#4ade80]">{formatPounds(result?.prize_per_winner ?? 0)}</p>
                    </div>
                  </div>
                  <p className="text-xs text-[#6b7c6e] mt-2">
                    Submitted: {format(new Date(v.submitted_at), 'd MMM yyyy HH:mm')}
                  </p>
                  {v.proof_url && (
                    <a href={v.proof_url} target="_blank" rel="noopener noreferrer"
                      className="inline-block mt-2 text-xs text-[#4ade80] hover:underline">
                      View proof screenshot →
                    </a>
                  )}
                  {v.admin_note && (
                    <p className="text-xs text-[#6b7c6e] mt-1 italic">Note: {v.admin_note}</p>
                  )}
                </div>
                {v.admin_status === 'pending' && (
                  <WinnerActions
                    verificationId={v.id}
                    userId={v.user_id}
                    prize={result?.prize_per_winner ?? 0}
                  />
                )}
                {v.admin_status === 'approved' && v.payment_status === 'pending' && (
                  <WinnerActions verificationId={v.id} userId={v.user_id} prize={result?.prize_per_winner ?? 0} markPaidOnly />
                )}
              </div>
            </Card>
          )
        }) : (
          <Card><p className="text-center text-[#6b7c6e] py-8">No winner claims yet</p></Card>
        )}
      </div>
    </div>
  )
}
