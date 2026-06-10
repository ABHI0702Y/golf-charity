import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Card from '@/components/ui/Card'
import { Heart, ExternalLink, Search } from 'lucide-react'

export default async function CharitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; filter?: string }>
}) {
  const { q, filter } = await searchParams
  const supabase = await createClient()

  let query = supabase.from('charities').select('*').order('featured', { ascending: false }).order('name')
  if (q) query = query.ilike('name', `%${q}%`)
  if (filter === 'featured') query = query.eq('featured', true)
  const { data: charities } = await query

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-black mb-3">
          Charities we <span className="gradient-text">support</span>
        </h1>
        <p className="text-[#6b7c6e] max-w-xl mx-auto">
          Every subscription contributes to real causes. Choose the one closest to your heart.
        </p>
      </div>

      {/* Search + Filter */}
      <form method="get" className="mb-10 flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7c6e]" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search charities…"
            className="w-full pl-10 pr-4 py-3 bg-[#111816] border border-[#1e2d24] rounded-xl text-[#f0f4f1] placeholder-[#6b7c6e] focus:outline-none focus:ring-2 focus:ring-[#4ade80]/50"
          />
        </div>
        <select
          name="filter"
          defaultValue={filter ?? ''}
          className="py-3 px-4 bg-[#111816] border border-[#1e2d24] rounded-xl text-[#f0f4f1] focus:outline-none focus:ring-2 focus:ring-[#4ade80]/50"
        >
          <option value="">All charities</option>
          <option value="featured">Featured only</option>
        </select>
        <button type="submit" className="px-6 py-3 bg-[#4ade80] text-[#0a0f0d] font-bold rounded-xl hover:bg-[#22c55e] transition-colors">
          Search
        </button>
      </form>

      {charities && charities.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {charities.map(c => (
            <Card key={c.id} hover className="flex flex-col">
              {c.featured && (
                <span className="inline-block mb-3 text-xs font-bold text-[#d4a017] uppercase tracking-widest">
                  ★ Featured
                </span>
              )}
              <div className="w-12 h-12 rounded-xl bg-[#4ade80]/10 flex items-center justify-center mb-4">
                <Heart size={20} className="text-[#4ade80]" />
              </div>
              <h2 className="font-bold text-xl mb-2">{c.name}</h2>
              <p className="text-sm text-[#6b7c6e] flex-1 line-clamp-4">{c.description}</p>
              <div className="mt-4 flex items-center gap-4">
                <Link href={`/charities/${c.id}`}
                  className="text-sm font-medium text-[#4ade80] hover:underline">
                  View profile →
                </Link>
                {c.website && (
                  <a href={c.website} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-[#6b7c6e] hover:text-[#f0f4f1]">
                    <ExternalLink size={12} /> Website
                  </a>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-center text-[#6b7c6e] py-16">No charities found{q ? ` for "${q}"` : ''}.</p>
      )}
    </div>
  )
}
