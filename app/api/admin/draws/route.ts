import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import {
  generateRandomDraw,
  generateAlgorithmicDraw,
  countMatches,
  calculatePrizePools,
  currentMonth,
} from '@/lib/utils'
import { sendDrawResultEmail } from '@/lib/email'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  return profile?.role === 'admin' ? user : null
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { action, month, drawType } = await req.json()
  const targetMonth = month ?? currentMonth()
  const db = getAdminClient()

  // Get all active subscribers with their scores
  const { data: subscribers } = await db
    .from('subscriptions')
    .select('user_id')
    .eq('status', 'active')

  if (!subscribers?.length) return NextResponse.json({ error: 'No active subscribers' }, { status: 400 })

  const userIds = subscribers.map(s => s.user_id)
  const { data: allScores } = await db
    .from('golf_scores')
    .select('user_id, score')
    .in('user_id', userIds)

  const scoresByUser = new Map<string, number[]>()
  for (const s of allScores ?? []) {
    if (!scoresByUser.has(s.user_id)) scoresByUser.set(s.user_id, [])
    scoresByUser.get(s.user_id)!.push(s.score)
  }

  const allScoreValues = (allScores ?? []).map(s => s.score)

  // Generate drawn numbers
  const drawnNumbers = drawType === 'algorithmic'
    ? generateAlgorithmicDraw(allScoreValues, subscribers.length)
    : generateRandomDraw()

  // Get jackpot rollover
  const { data: jackpotRow } = await db
    .from('jackpot_ledger')
    .select('amount')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const jackpotRollover = jackpotRow?.amount ?? 0
  const poolPerSubscriber = 19.99 * 0.60
  const totalPool = subscribers.length * poolPerSubscriber
  const prizePools = calculatePrizePools(totalPool, jackpotRollover)

  // Determine winners by match count
  const winnersByTier: Record<number, string[]> = { 3: [], 4: [], 5: [] }
  for (const [userId, scores] of scoresByUser.entries()) {
    const matches = countMatches(scores, drawnNumbers)
    if (matches >= 3 && matches <= 5) {
      winnersByTier[matches].push(userId)
    }
  }

  if (action === 'simulate') {
    const { data: draw, error } = await db
      .from('draws')
      .upsert({
        month: targetMonth,
        status: 'simulated',
        draw_type: drawType,
        drawn_numbers: drawnNumbers,
        jackpot_rollover: jackpotRollover,
        total_pool: totalPool,
        active_subscribers: subscribers.length,
      }, { onConflict: 'month' })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ draw })
  }

  if (action === 'publish') {
    const { data: draw, error: drawError } = await db
      .from('draws')
      .upsert({
        month: targetMonth,
        status: 'published',
        draw_type: drawType,
        drawn_numbers: drawnNumbers,
        jackpot_rollover: jackpotRollover,
        total_pool: totalPool,
        active_subscribers: subscribers.length,
        published_at: new Date().toISOString(),
      }, { onConflict: 'month' })
      .select()
      .single()

    if (drawError) return NextResponse.json({ error: drawError.message }, { status: 500 })

    await db.from('draw_results').delete().eq('draw_id', draw.id)

    const hasJackpotWinner = winnersByTier[5].length > 0

    for (const tier of [3, 4, 5] as const) {
      const winners = winnersByTier[tier]
      const pool = prizePools[tier]
      const prizePerWinner = winners.length > 0 ? pool / winners.length : 0

      await db.from('draw_results').insert({
        draw_id: draw.id,
        match_type: tier,
        user_ids: winners,
        prize_pool: pool,
        prize_per_winner: prizePerWinner,
      })
    }

    if (!hasJackpotWinner) {
      await db.from('jackpot_ledger').insert({
        draw_id: draw.id,
        amount: jackpotRollover + prizePools[5],
        note: `Jackpot rolled over from ${targetMonth}`,
      })
    } else {
      await db.from('jackpot_ledger').insert({
        draw_id: draw.id,
        amount: 0,
        note: `Jackpot won in ${targetMonth}`,
      })
    }

    // Notify subscribers
    for (const userId of userIds) {
      const { data: { user } } = await db.auth.admin.getUserById(userId)
      if (!user?.email) continue

      const userScores = scoresByUser.get(userId) ?? []
      const matchCount = countMatches(userScores, drawnNumbers)
      const isWinner = matchCount >= 3
      const prize = isWinner
        ? prizePools[matchCount as 3 | 4 | 5] / (winnersByTier[matchCount].length || 1)
        : undefined

      await sendDrawResultEmail(
        user.email, '', targetMonth, drawnNumbers, isWinner,
        isWinner ? matchCount : undefined, prize
      ).catch(console.error)
    }

    return NextResponse.json({ draw })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
