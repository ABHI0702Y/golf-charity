import { createClient } from '@/lib/supabase/server'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { format } from 'date-fns'
import Link from 'next/link'

export default async function AdminUsersPage() {
  const supabase = await createClient()

  const { data: users } = await supabase
    .from('profiles')
    .select('*, subscriptions(plan, status), charities(name)')
    .order('created_at', { ascending: false })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Users</h1>
          <p className="text-[#6b7c6e] text-sm mt-1">{users?.length ?? 0} total users</p>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1e2d24]">
                <th className="text-left p-4 text-[#6b7c6e] font-medium">User</th>
                <th className="text-left p-4 text-[#6b7c6e] font-medium">Role</th>
                <th className="text-left p-4 text-[#6b7c6e] font-medium">Subscription</th>
                <th className="text-left p-4 text-[#6b7c6e] font-medium">Charity</th>
                <th className="text-left p-4 text-[#6b7c6e] font-medium">Joined</th>
                <th className="text-left p-4 text-[#6b7c6e] font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users?.map(u => {
                const sub = Array.isArray(u.subscriptions) ? u.subscriptions[0] : u.subscriptions
                const charity = Array.isArray(u.charities) ? u.charities[0] : u.charities
                return (
                  <tr key={u.id} className="border-b border-[#1e2d24] hover:bg-[#111816]/50">
                    <td className="p-4">
                      <p className="font-medium">{u.full_name ?? '—'}</p>
                      <p className="text-xs text-[#6b7c6e]">{u.id.slice(0, 8)}…</p>
                    </td>
                    <td className="p-4">
                      <Badge variant={u.role === 'admin' ? 'pending' : 'default'}>{u.role}</Badge>
                    </td>
                    <td className="p-4">
                      {sub ? (
                        <div>
                          <Badge variant={sub.status === 'active' ? 'active' : 'inactive'}>{sub.status}</Badge>
                          <p className="text-xs text-[#6b7c6e] mt-1 capitalize">{sub.plan}</p>
                        </div>
                      ) : <span className="text-[#6b7c6e]">None</span>}
                    </td>
                    <td className="p-4 text-[#6b7c6e]">{(charity as { name?: string } | null)?.name ?? '—'}</td>
                    <td className="p-4 text-[#6b7c6e]">
                      {format(new Date(u.created_at), 'd MMM yyyy')}
                    </td>
                    <td className="p-4">
                      <Link href={`/admin/users/${u.id}`}
                        className="text-[#4ade80] text-xs hover:underline">
                        Manage →
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
