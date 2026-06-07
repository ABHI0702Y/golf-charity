import { createClient } from '@/lib/supabase/server'
import Card, { CardHeader, CardTitle } from '@/components/ui/Card'
import { formatPounds, formatMonth } from '@/lib/utils'

export default async function AdminReportsPage() {
  const supabase = await createClient()

  const [
    { count: totalUsers },
    { count: activeSubscribers },
    { data: draws },
    { data: charities },
    { data: verifications },
    { data: jackpot },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('draws').select('month, total_pool, jackpot_rollover, active_subscribers, status, draw_results(match_type, prize_pool, user_ids)').order('month', { ascending: false }),
    supabase.from('charities').select('id, name, profiles(count)'),
    supabase.from('winner_verifications').select('payment_status, draw_results(prize_per_winner)'),
    supabase.from('jackpot_ledger').select('amount').order('created_at', { ascending: false }).limit(1).single(),
  ])

  const totalPrizePool = (draws ?? []).reduce((sum, d) => sum + (d.total_pool ?? 0), 0)
  const totalPaidOut = (verifications ?? [])
    .filter(v => v.payment_status === 'paid')
    .reduce((sum, v) => {
      const result = v.draw_results as { prize_per_winner?: number } | null
      return sum + (result?.prize_per_winner ?? 0)
    }, 0)

  const monthlyRev = (activeSubscribers ?? 0) * 19.99
  const charityContrib = monthlyRev * 0.10

  const drawStats = (draws ?? []).map(d => {
    const results = Array.isArray(d.draw_results) ? d.draw_results : []
    const winners = results.flatMap((r: { user_ids: string[] }) => r.user_ids ?? [])
    return {
      month: d.month,
      pool: d.total_pool,
      subscribers: d.active_subscribers,
      winners: winners.length,
      status: d.status,
    }
  })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-black">Reports & Analytics</h1>
        <p className="text-[#6b7c6e] text-sm mt-1">Platform-wide statistics</p>
      </div>

      {/* Key metrics */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'Total registered users', value: totalUsers ?? 0, format: 'number' },
          { label: 'Active subscribers', value: activeSubscribers ?? 0, format: 'number' },
          { label: 'Total prize pool (all time)', value: totalPrizePool, format: 'currency' },
          { label: 'Total paid out', value: totalPaidOut, format: 'currency' },
          { label: 'Est. monthly revenue', value: monthlyRev, format: 'currency' },
          { label: 'Est. monthly charity contribution', value: charityContrib, format: 'currency' },
          { label: 'Current jackpot', value: jackpot?.amount ?? 0, format: 'currency' },
          { label: 'Total draws run', value: draws?.length ?? 0, format: 'number' },
          { label: 'Total winners', value: verifications?.length ?? 0, format: 'number' },
        ].map(s => (
          <Card key={s.label}>
            <p className="text-xs text-[#6b7c6e] mb-1">{s.label}</p>
            <p className="text-2xl font-black text-[#4ade80]">
              {s.format === 'currency' ? formatPounds(s.value as number) : s.value}
            </p>
          </Card>
        ))}
      </div>

      {/* Draw stats table */}
      <Card>
        <CardHeader><CardTitle>Draw statistics</CardTitle></CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1e2d24]">
                <th className="text-left py-3 text-[#6b7c6e] font-medium">Month</th>
                <th className="text-left py-3 text-[#6b7c6e] font-medium">Subscribers</th>
                <th className="text-left py-3 text-[#6b7c6e] font-medium">Pool</th>
                <th className="text-left py-3 text-[#6b7c6e] font-medium">Winners</th>
                <th className="text-left py-3 text-[#6b7c6e] font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {drawStats.map(d => (
                <tr key={d.month} className="border-b border-[#1e2d24] last:border-0">
                  <td className="py-3 font-medium">{formatMonth(d.month)}</td>
                  <td className="py-3 text-[#6b7c6e]">{d.subscribers}</td>
                  <td className="py-3 text-[#4ade80] font-medium">{formatPounds(d.pool)}</td>
                  <td className="py-3">{d.winners}</td>
                  <td className="py-3 capitalize text-[#6b7c6e]">{d.status}</td>
                </tr>
              ))}
              {!drawStats.length && (
                <tr><td colSpan={5} className="py-6 text-center text-[#6b7c6e]">No draws yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Charity breakdown */}
      <Card>
        <CardHeader><CardTitle>Charity supporters</CardTitle></CardHeader>
        <div className="flex flex-col gap-3">
          {(charities ?? []).map(c => {
            const count = Array.isArray(c.profiles) ? (c.profiles as { count: number }[])[0]?.count ?? 0 : 0
            return (
              <div key={c.id} className="flex items-center justify-between py-2 border-b border-[#1e2d24] last:border-0">
                <p className="font-medium">{c.name}</p>
                <p className="text-sm text-[#6b7c6e]">{count} supporters</p>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
