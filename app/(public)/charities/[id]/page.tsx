import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import { ExternalLink, Heart, ArrowLeft } from 'lucide-react'

export default async function CharityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: charity } = await supabase.from('charities').select('*').eq('id', id).single()
  if (!charity) notFound()

  // Count supporters
  const { count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('charity_id', id)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Link href="/charities" className="inline-flex items-center gap-2 text-sm text-[#6b7c6e] hover:text-[#f0f4f1] mb-8">
        <ArrowLeft size={16} /> Back to charities
      </Link>

      <div className="bg-[#111816] border border-[#1e2d24] rounded-3xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#4ade80]/10 to-[#d4a017]/5 p-8 md:p-12 border-b border-[#1e2d24]">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 rounded-2xl bg-[#4ade80]/20 flex items-center justify-center flex-shrink-0">
              <Heart size={28} className="text-[#4ade80]" />
            </div>
            <div className="flex-1">
              {charity.featured && (
                <span className="text-xs font-bold text-[#d4a017] uppercase tracking-widest block mb-2">★ Featured Charity</span>
              )}
              <h1 className="text-3xl md:text-4xl font-black mb-2">{charity.name}</h1>
              <p className="text-[#6b7c6e]">{count ?? 0} supporters on GolfGives</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-8 md:p-12">
          <h2 className="font-bold text-lg mb-4 text-[#4ade80]">About this charity</h2>
          <p className="text-[#6b7c6e] leading-relaxed whitespace-pre-wrap mb-8">{charity.description}</p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/signup">
              <Button size="lg" className="group">
                <Heart size={18} /> Support this charity
              </Button>
            </Link>
            {charity.website && (
              <a href={charity.website} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="lg">
                  <ExternalLink size={18} /> Visit website
                </Button>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
