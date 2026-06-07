import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Card, { CardHeader, CardTitle } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { formatPounds } from '@/lib/utils'
import { format } from 'date-fns'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import { Target, Heart, Trophy, TrendingUp } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { data: profile },
    { data: sub },
    { data: scores },
    { data: draws },
    { data: verifications },
  ] = await Promise.all([
    supabase.from('profiles').select('*, charities(name)').eq('id', user.id).single(),
    supabase.from('subscriptions').select('*').eq('user_id', user.id).single(),
    supabase.from('golf_scores').select('*').eq('user_id', user.id).order('played_at', { ascending: false }),
    supabase.from('draws').select('*, draw_results(*)').eq('status', 'published').order('month', { ascending: false }).limit(3),
    supabase.from('winner_verifications').select('*, draw_results(prize_per_winner, draws(month))').eq('user_id', user.id),
  ])

  const totalWon = verifications?.filter(v => v.payment_status === 'paid')
    .reduce((sum, v) => sum + (v.draw_results?.prize_per_winner ?? 0), 0) ?? 0

  const statusVariant: Record<string, 'active' | 'inactive' | 'pending'> = {
    active: 'active', inactive: 'inactive', cancelled: 'inactive', lapsed: 'inactive',
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-black">
          Welcome back, {profile?.full_name?.split(' ')[0] ?? 'Player'} 👋
        </h1>
        <p className="text-[#6b7c6e] text-sm mt-1">Here&apos;s your overview</p>
      </div>

      {/* Stats grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#4ade80]/10 flex items-center justify-center flex-shrink-0">
            <TrendingUp size={18} className="text-[#4ade80]" />
          </div>
          <div>
            <p className="text-xs text-[#6b7c6e]">Subscription</p>
            <Badge variant={statusVariant[sub?.status ?? 'inactive'] ?? 'inactive'} className="mt-0.5">
              {sub?.status ?? 'inactive'}
            </Badge>
            {sub?.current_period_end && (
              <p className="text-xs text-[#6b7c6e] mt-1">
                Renews {format(new Date(sub.current_period_end), 'd MMM yyyy')}
              </p>
            )}
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
            <Target size={18} className="text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-[#6b7c6e]">Scores entered</p>
            <p className="text-xl font-bold">{scores?.length ?? 0}<span className="text-sm text-[#6b7c6e] font-normal">/5</span></p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#d4a017]/10 flex items-center justify-center flex-shrink-0">
            <Heart size={18} className="text-[#d4a017]" />
          </div>
          <div>
            <p className="text-xs text-[#6b7c6e]">Supporting</p>
            <p className="text-sm font-bold truncate max-w-[100px]">
              {(profile as { charities?: { name: string } | null })?.charities?.name ?? 'Not selected'}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
            <Trophy size={18} className="text-purple-400" />
          </div>
          <div>
            <p className="text-xs text-[#6b7c6e]">Total won</p>
            <p className="text-xl font-bold">{formatPounds(totalWon)}</p>
          </div>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent scores */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>My Scores</CardTitle>
            <Link href="/dashboard/scores">
              <Button variant="ghost" size="sm">Manage →</Button>
            </Link>
          </CardHeader>
          {scores && scores.length > 0 ? (
            <div className="flex flex-col gap-2">
              {scores.slice(0, 5).map(s => (
                <div key={s.id} className="flex items-center justify-between py-2 border-b border-[#1e2d24] last:border-0">
                  <span className="text-sm text-[#6b7c6e]">{format(new Date(s.played_at), 'd MMM yyyy')}</span>
                  <span className="font-bold text-[#4ade80]">{s.score} pts</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-[#6b7c6e] text-sm mb-3">No scores yet</p>
              <Link href="/dashboard/scores"><Button size="sm">Add first score</Button></Link>
            </div>
          )}
        </Card>

        {/* Recent draws */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Recent Draws</CardTitle>
            <Link href="/dashboard/draws">
              <Button variant="ghost" size="sm">View all →</Button>
            </Link>
          </CardHeader>
          {draws && draws.length > 0 ? (
            <div className="flex flex-col gap-3">
              {draws.map(d => (
                <div key={d.id} className="flex items-center justify-between py-2 border-b border-[#1e2d24] last:border-0">
                  <div>
                    <p className="text-sm font-medium">{d.month}</p>
                    <p className="text-xs text-[#6b7c6e]">Pool: {formatPounds(d.total_pool)}</p>
                  </div>
                  <div className="flex gap-1">
                    {d.drawn_numbers.slice(0, 5).map((n: number) => (
                      <span key={n} className="w-7 h-7 rounded-full bg-[#1e2d24] flex items-center justify-center text-xs font-bold">
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-[#6b7c6e] text-sm py-6">No draws published yet</p>
          )}
        </Card>
      </div>

      {/* Winnings */}
      {verifications && verifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Winnings overview</CardTitle>
          </CardHeader>
          <div className="flex flex-col gap-2">
            {verifications.map(v => (
              <div key={v.id} className="flex items-center justify-between py-2 border-b border-[#1e2d24] last:border-0">
                <div>
                  <p className="text-sm font-medium">{(v.draw_results as { draws?: { month: string } })?.draws?.month}</p>
                  <p className="text-xs text-[#6b7c6e]">{formatPounds(v.draw_results?.prize_per_winner ?? 0)}</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant={v.admin_status as 'pending' | 'approved' | 'rejected'}>{v.admin_status}</Badge>
                  <Badge variant={v.payment_status as 'pending' | 'paid'}>{v.payment_status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
