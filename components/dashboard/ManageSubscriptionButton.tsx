'use client'
import { useState } from 'react'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

export default function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false)

  async function openPortal() {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else toast.error(data.error || 'Failed to open billing portal')
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" loading={loading} onClick={openPortal}>
      Manage billing & cancel
    </Button>
  )
}
