'use client'
import { useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import toast from 'react-hot-toast'

interface Props {
  verificationId: string
  userId: string
  prize: number
  markPaidOnly?: boolean
}

export default function WinnerActions({ verificationId, userId, prize, markPaidOnly }: Props) {
  const [loading, setLoading] = useState<string | null>(null)
  const [note, setNote] = useState('')

  async function updateVerification(action: 'approve' | 'reject' | 'mark_paid') {
    setLoading(action)
    const res = await fetch('/api/admin/winners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verificationId, action, note, userId, prize }),
    })
    const data = await res.json()
    setLoading(null)
    if (data.error) toast.error(data.error)
    else { toast.success('Updated!'); window.location.reload() }
  }

  if (markPaidOnly) {
    return (
      <Button size="sm" loading={loading === 'mark_paid'} onClick={() => updateVerification('mark_paid')}>
        Mark as paid
      </Button>
    )
  }

  return (
    <div className="flex flex-col gap-2 min-w-[160px]">
      <Input
        placeholder="Admin note (optional)"
        value={note}
        onChange={e => setNote(e.target.value)}
      />
      <Button size="sm" loading={loading === 'approve'} onClick={() => updateVerification('approve')}>
        Approve
      </Button>
      <Button size="sm" variant="danger" loading={loading === 'reject'} onClick={() => updateVerification('reject')}>
        Reject
      </Button>
    </div>
  )
}
