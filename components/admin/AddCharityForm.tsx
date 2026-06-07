'use client'
import { useState } from 'react'
import Card, { CardHeader, CardTitle } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

export default function AddCharityForm() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [website, setWebsite] = useState('')
  const [featured, setFeatured] = useState(false)
  const [saving, setSaving] = useState(false)

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/admin/charities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, website, featured }),
    })
    const data = await res.json()
    setSaving(false)
    if (data.error) toast.error(data.error)
    else {
      toast.success('Charity added!')
      setName(''); setDescription(''); setWebsite(''); setFeatured(false)
      setOpen(false)
      window.location.reload()
    }
  }

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Add charity</CardTitle>
        <Button size="sm" variant="outline" onClick={() => setOpen(!open)}>
          {open ? 'Cancel' : '+ Add new'}
        </Button>
      </CardHeader>
      {open && (
        <form onSubmit={save} className="flex flex-col gap-4 mt-2">
          <Input label="Charity name" value={name} onChange={e => setName(e.target.value)} required />
          <div>
            <label className="text-sm font-medium text-[#6b7c6e] block mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 bg-[#0a0f0d] border border-[#1e2d24] rounded-xl text-[#f0f4f1] placeholder-[#6b7c6e] focus:outline-none focus:ring-2 focus:ring-[#4ade80]/50 resize-none"
            />
          </div>
          <Input label="Website (optional)" type="url" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://" />
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} className="rounded" />
            Featured charity (shown on homepage)
          </label>
          <Button type="submit" loading={saving} className="self-start">Save charity</Button>
        </form>
      )}
    </Card>
  )
}
