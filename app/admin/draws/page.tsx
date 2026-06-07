import { createClient } from '@/lib/supabase/server'
import Card, { CardHeader, CardTitle } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { formatPounds, formatMonth, currentMonth } from '@/lib/utils'
import DrawEngine from '@/components/admin/DrawEngine'

export default async function AdminDrawsPage() {
  const supabase = await createClient()

  const { data: draws } = await supabase
    .from('draws')
    .select('*, draw_results(*)')
    .order('month', { ascending: false })

  const { count: activeSubscribers } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  const { data: jackpotRow } = await supabase
    .from('jackpot_ledger')
    .select('amount')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const currentDraw = draws?.find(d => d.month === currentMonth())

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-black">Draw Management</h1>
        <p className="text-[#6b7c6e] text-sm mt-1">Configure, simulate, and publish monthly draws</p>
      </div>

      {/* Draw engine */}
      <DrawEngine
        currentMonth={currentMonth()}
        currentDraw={currentDraw ?? null}
        activeSubscribers={activeSubscribers ?? 0}
        jackpotRollover={jackpotRow?.amount ?? 0}
      />

      {/* Draw history */}
      <Card>
        <CardHeader><CardTitle>Draw history</CardTitle></CardHeader>
        <div className="flex flex-col gap-3">
          {draws?.map(draw => (
            <div key={draw.id} className="flex items-center justify-between p-3 rounded-xl bg-[#0a0f0d] border border-[#1e2d24]">
              <div>
                <p className="font-medium">{formatMonth(draw.month)}</p>
                <p className="text-xs text-[#6b7c6e]">Pool: {formatPounds(draw.total_pool)}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {draw.drawn_numbers.slice(0, 5).map((n: number) => (
                    <span key={n} className="w-7 h-7 rounded-full bg-[#1e2d24] flex items-center justify-center text-xs font-bold">
                      {n}
                    </span>
                  ))}
                </div>
                <Badge variant={draw.status as 'draft' | 'published'}>{draw.status}</Badge>
              </div>
            </div>
          ))}
          {!draws?.length && <p className="text-center text-[#6b7c6e] py-6">No draws yet</p>}
        </div>
      </Card>
    </div>
  )
}
