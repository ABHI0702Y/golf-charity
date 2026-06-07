import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { sendWinnerVerificationEmail } from '@/lib/email'

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

  const { verificationId, action, note, userId, prize } = await req.json()
  const db = getAdminClient()

  if (action === 'approve') {
    const { error } = await db
      .from('winner_verifications')
      .update({ admin_status: 'approved', admin_note: note ?? null, reviewed_at: new Date().toISOString() })
      .eq('id', verificationId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const { data: { user } } = await db.auth.admin.getUserById(userId)
    if (user?.email) {
      await sendWinnerVerificationEmail(user.email, '', 'approved', prize).catch(console.error)
    }
    return NextResponse.json({ success: true })
  }

  if (action === 'reject') {
    const { error } = await db
      .from('winner_verifications')
      .update({ admin_status: 'rejected', admin_note: note ?? null, reviewed_at: new Date().toISOString() })
      .eq('id', verificationId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const { data: { user } } = await db.auth.admin.getUserById(userId)
    if (user?.email) {
      await sendWinnerVerificationEmail(user.email, '', 'rejected', undefined, note).catch(console.error)
    }
    return NextResponse.json({ success: true })
  }

  if (action === 'mark_paid') {
    const { error } = await db
      .from('winner_verifications')
      .update({ payment_status: 'paid' })
      .eq('id', verificationId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
