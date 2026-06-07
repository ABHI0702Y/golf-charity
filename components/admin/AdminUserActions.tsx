'use client'
import { useState } from 'react'
import Card, { CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface Props {
  userId: string
  currentRole: string
}

export default function AdminUserActions({ userId, currentRole }: Props) {
  const [toggling, setToggling] = useState(false)

  async function toggleRole() {
    setToggling(true)
    const newRole = currentRole === 'admin' ? 'subscriber' : 'admin'
    const res = await fetch('/api/admin/users/role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role: newRole }),
    })
    const data = await res.json()
    setToggling(false)
    if (data.error) toast.error(data.error)
    else { toast.success('Role updated'); window.location.reload() }
  }

  return (
    <Card>
      <CardHeader><CardTitle>Admin actions</CardTitle></CardHeader>
      <div className="flex gap-3">
        <Button variant="outline" loading={toggling} onClick={toggleRole}>
          {currentRole === 'admin' ? 'Remove admin' : 'Make admin'}
        </Button>
      </div>
    </Card>
  )
}
