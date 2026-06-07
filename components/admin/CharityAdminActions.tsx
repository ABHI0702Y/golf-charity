'use client'
import { useState } from 'react'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface Props {
  charityId: string
  isFeatured: boolean
}

export default function CharityAdminActions({ charityId, isFeatured }: Props) {
  const [loading, setLoading] = useState<string | null>(null)

  async function action(type: 'toggle_featured' | 'delete') {
    if (type === 'delete' && !confirm('Delete this charity?')) return
    setLoading(type)
    const res = await fetch('/api/admin/charities', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ charityId, action: type }),
    })
    const data = await res.json()
    setLoading(null)
    if (data.error) toast.error(data.error)
    else { toast.success('Updated!'); window.location.reload() }
  }

  return (
    <div className="flex gap-2 flex-shrink-0">
      <Button size="sm" variant="outline" loading={loading === 'toggle_featured'} onClick={() => action('toggle_featured')}>
        {isFeatured ? 'Unfeature' : 'Feature'}
      </Button>
      <Button size="sm" variant="danger" loading={loading === 'delete'} onClick={() => action('delete')}>
        Delete
      </Button>
    </div>
  )
}
