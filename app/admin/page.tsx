import { createClient } from '@/lib/supabase/server'
import Card, { CardHeader, CardTitle } from '@/components/ui/Card'
import { formatPounds } from '@/lib/utils'
import { Users, Trophy, Heart, DollarSign } from 'lucide-react'

export default async function AdminOverviewPage() {
  const supabase = await createClient()

  const [
    { count: totalUsers },
    { count: activeSubscribers },
    { data: draws },
    {},
    { count: pendingVerifications },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('draws').select('total_pool').eq('status', 'published'),
    supabase.from('jackpot_ledger').select('amount').order('created_at', { ascending: false }).limit(1).single(),
    supabase.from('winner_verifications').select('*', { count: 'exact', head: true }).eq('admin_status', 'pending'),
  ])

  const totalPool = (draws ?? []).reduce((sum, d) => sum + (d.total_pool ?? 0), 0)

  const stats = [
    { label: 'Total users', value: totalUsers ?? 0, icon: <Users size={20} className="text-blue-400" />, bg: 'bg-blue-500/10' },
    { label: 'Active subscribers', value: activeSubscribers ?? 0, icon: <Trophy size={20} className="text-[#4ade80]" />, bg: 'bg-[#4ade80]/10' },
    { label: 'Total prize pools', value: formatPounds(totalPool), icon: <DollarSign size={20} className="text-[#d4a017]" />, bg: 'bg-[#d4a017]/10' },
    { label: 'Pending verifications', value: pendingVerifications ?? 0, icon: <Heart size={20} className="text-red-400" />, bg: 'bg-red-500/10' },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-black">Admin Overview</h1>
        <p className="text-[#6b7c6e] text-sm mt-1">Platform-wide snapshot</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <Card key={s.label} className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
              {s.icon}
            </div>
            <div>
              <p className="text-xs text-[#6b7c6e]">{s.label}</p>
              <p className="text-xl font-bold">{s.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick actions</CardTitle>
        </CardHeader>
        <div className="grid sm:grid-cols-3 gap-3">
          <a href="/admin/draws" className="p-4 rounded-xl bg-[#0a0f0d] border border-[#1e2d24] hover:border-[#4ade80]/30 transition-all">
            <Trophy size={20} className="text-[#4ade80] mb-2" />
            <p className="font-medium text-sm">Run monthly draw</p>
            <p className="text-xs text-[#6b7c6e] mt-1">Configure and publish</p>
          </a>
          <a href="/admin/winners" className="p-4 rounded-xl bg-[#0a0f0d] border border-[#1e2d24] hover:border-[#d4a017]/30 transition-all">
            <Heart size={20} className="text-[#d4a017] mb-2" />
            <p className="font-medium text-sm">Review winner claims</p>
            <p className="text-xs text-[#6b7c6e] mt-1">{pendingVerifications ?? 0} pending</p>
          </a>
          <a href="/admin/charities" className="p-4 rounded-xl bg-[#0a0f0d] border border-[#1e2d24] hover:border-blue-500/30 transition-all">
            <Users size={20} className="text-blue-400 mb-2" />
            <p className="font-medium text-sm">Manage charities</p>
            <p className="text-xs text-[#6b7c6e] mt-1">Add, edit, feature</p>
          </a>
        </div>
      </Card>
    </div>
  )
}
