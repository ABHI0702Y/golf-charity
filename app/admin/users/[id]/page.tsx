import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Card, { CardHeader, CardTitle } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { format } from 'date-fns'
import AdminUserActions from '@/components/admin/AdminUserActions'

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: user } = await supabase
    .from('profiles')
    .select('*, subscriptions(*), charities(name)')
    .eq('id', id)
    .single()

  if (!user) notFound()

  const { data: scores } = await supabase
    .from('golf_scores')
    .select('*')
    .eq('user_id', id)
    .order('played_at', { ascending: false })

  const sub = Array.isArray(user.subscriptions) ? user.subscriptions[0] : user.subscriptions
  const charity = Array.isArray(user.charities) ? user.charities[0] : user.charities

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-black">{user.full_name ?? 'User'}</h1>
        <p className="text-[#6b7c6e] text-sm mt-1">User ID: {user.id}</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
          <dl className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-[#6b7c6e]">Role</dt>
              <dd><Badge variant={user.role === 'admin' ? 'pending' : 'default'}>{user.role}</Badge></dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[#6b7c6e]">Charity</dt>
              <dd>{(charity as { name?: string } | null)?.name ?? '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[#6b7c6e]">Charity %</dt>
              <dd>{user.charity_percentage}%</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[#6b7c6e]">Joined</dt>
              <dd>{format(new Date(user.created_at), 'd MMM yyyy')}</dd>
            </div>
          </dl>
        </Card>

        <Card>
          <CardHeader><CardTitle>Subscription</CardTitle></CardHeader>
          {sub ? (
            <dl className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-[#6b7c6e]">Status</dt>
                <dd><Badge variant={sub.status === 'active' ? 'active' : 'inactive'}>{sub.status}</Badge></dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#6b7c6e]">Plan</dt>
                <dd className="capitalize">{sub.plan}</dd>
              </div>
              {sub.current_period_end && (
                <div className="flex justify-between">
                  <dt className="text-[#6b7c6e]">Period end</dt>
                  <dd>{format(new Date(sub.current_period_end), 'd MMM yyyy')}</dd>
                </div>
              )}
            </dl>
          ) : <p className="text-[#6b7c6e] text-sm">No subscription</p>}
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Golf Scores</CardTitle></CardHeader>
        {scores && scores.length > 0 ? (
          <div className="flex flex-col gap-2">
            {scores.map(s => (
              <div key={s.id} className="flex justify-between py-2 border-b border-[#1e2d24] last:border-0 text-sm">
                <span className="text-[#6b7c6e]">{format(new Date(s.played_at), 'd MMM yyyy')}</span>
                <span className="font-bold text-[#4ade80]">{s.score} pts</span>
              </div>
            ))}
          </div>
        ) : <p className="text-[#6b7c6e] text-sm">No scores</p>}
      </Card>

      <AdminUserActions userId={id} currentRole={user.role} />
    </div>
  )
}
