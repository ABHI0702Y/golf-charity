'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'
import { Upload } from 'lucide-react'
import { formatPounds } from '@/lib/utils'

interface Props {
  drawResultId: string
  userId: string
  prize: number
}

export default function ClaimForm({ drawResultId, userId, prize }: Props) {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) { toast.error('Please select a screenshot'); return }
    setUploading(true)
    const supabase = createClient()

    // Upload proof to Supabase Storage
    const ext = file.name.split('.').pop()
    const path = `proofs/${userId}/${drawResultId}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('winner-proofs')
      .upload(path, file, { upsert: true })

    if (uploadError) {
      toast.error('Upload failed: ' + uploadError.message)
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('winner-proofs').getPublicUrl(path)

    const { error } = await supabase.from('winner_verifications').insert({
      draw_result_id: drawResultId,
      user_id: userId,
      proof_url: publicUrl,
    })

    setUploading(false)
    if (error) toast.error(error.message)
    else {
      toast.success('Claim submitted! Admin will review shortly.')
      router.push('/dashboard/draws')
    }
  }

  return (
    <Card>
      <div className="bg-[#4ade80]/5 border border-[#4ade80]/20 rounded-xl p-4 mb-6 text-center">
        <p className="text-xs text-[#6b7c6e]">Your prize</p>
        <p className="text-3xl font-black text-[#4ade80]">{formatPounds(prize)}</p>
      </div>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div>
          <label className="text-sm font-medium text-[#6b7c6e] block mb-1.5">
            Score screenshot
          </label>
          <label className={`flex flex-col items-center gap-3 p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
            file ? 'border-[#4ade80]/50 bg-[#4ade80]/5' : 'border-[#1e2d24] hover:border-[#4ade80]/30'
          }`}>
            <Upload size={24} className="text-[#6b7c6e]" />
            <div className="text-center">
              <p className="text-sm font-medium">{file ? file.name : 'Click to upload screenshot'}</p>
              <p className="text-xs text-[#6b7c6e] mt-1">PNG, JPG, or WebP</p>
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>
        <Button type="submit" loading={uploading} size="lg">
          Submit claim
        </Button>
      </form>
    </Card>
  )
}
