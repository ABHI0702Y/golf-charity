import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatPounds } from '@/lib/utils'
import { ArrowRight, Heart, Trophy, Users, Zap } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

export default async function HomePage() {
  const supabase = await createClient()

  // Stats for social proof
  const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
  const { data: latestDraw } = await supabase
    .from('draws')
    .select('total_pool, month')
    .eq('status', 'published')
    .order('month', { ascending: false })
    .limit(1)
    .single()

  const { data: featuredCharities } = await supabase
    .from('charities')
    .select('*')
    .eq('featured', true)
    .limit(3)

  const { data: jackpotRow } = await supabase
    .from('jackpot_ledger')
    .select('amount')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const currentJackpot = jackpotRow?.amount ?? 0

  return (
    <div className="hero-gradient">
      {/* HERO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36 text-center">
        <div className="inline-flex items-center gap-2 bg-[#111816] border border-[#1e2d24] rounded-full px-4 py-1.5 text-sm text-[#4ade80] mb-8">
          <Heart size={14} className="fill-[#4ade80]" />
          Your subscription supports real charities
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-tight">
          Play Golf.<br />
          <span className="gradient-text">Give Back.</span><br />
          Win Big.
        </h1>
        <p className="text-xl text-[#6b7c6e] max-w-2xl mx-auto mb-10">
          Enter your Stableford scores, support the charity you care about, and compete in monthly prize draws. A platform built for golfers who want their game to matter.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/signup">
            <Button size="lg" className="group">
              Start your subscription
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="/charities">
            <Button size="lg" variant="outline">View charities</Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {[
            { label: 'Active players', value: `${userCount ?? 0}+` },
            { label: 'Current jackpot', value: formatPounds(currentJackpot || 500) },
            { label: 'Last pool', value: latestDraw ? formatPounds(latestDraw.total_pool) : '—' },
            { label: 'Charities supported', value: '5+' },
          ].map(s => (
            <div key={s.label} className="glass rounded-2xl p-4">
              <p className="text-2xl font-bold text-[#4ade80]">{s.value}</p>
              <p className="text-xs text-[#6b7c6e] mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">How it works</h2>
          <p className="text-[#6b7c6e]">Simple. Rewarding. Meaningful.</p>
        </div>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { icon: <Zap size={24} />, step: '01', title: 'Subscribe', desc: 'Choose a monthly or yearly plan. A portion supports your chosen charity automatically.' },
            { icon: <Users size={24} />, step: '02', title: 'Enter scores', desc: 'Log your latest 5 Stableford scores after each round. Simple, quick, no fuss.' },
            { icon: <Trophy size={24} />, step: '03', title: 'Join the draw', desc: 'Your scores enter the monthly prize draw automatically. Match 3, 4, or all 5 numbers to win.' },
            { icon: <Heart size={24} />, step: '04', title: 'Give back', desc: 'A minimum 10% of your subscription goes to your chosen charity. Increase it anytime.' },
          ].map(item => (
            <Card key={item.step} hover className="relative overflow-hidden">
              <div className="absolute top-4 right-4 text-5xl font-black text-[#1e2d24]">{item.step}</div>
              <div className="text-[#4ade80] mb-4">{item.icon}</div>
              <h3 className="font-bold text-lg mb-2">{item.title}</h3>
              <p className="text-sm text-[#6b7c6e]">{item.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* PRIZE TIERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Monthly prize tiers</h2>
          <p className="text-[#6b7c6e]">Three ways to win every month</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { match: '3 Numbers', share: '25%', color: 'from-blue-500/10 to-blue-500/5', border: 'border-blue-500/20', badge: 'Bronze' },
            { match: '4 Numbers', share: '35%', color: 'from-[#d4a017]/10 to-[#d4a017]/5', border: 'border-[#d4a017]/20', badge: 'Silver' },
            { match: '5 Numbers', share: '40% + Jackpot', color: 'from-[#4ade80]/10 to-[#4ade80]/5', border: 'border-[#4ade80]/20', badge: 'Jackpot ⚡' },
          ].map(tier => (
            <div key={tier.match} className={`bg-gradient-to-br ${tier.color} border ${tier.border} rounded-2xl p-6 text-center`}>
              <span className="text-xs font-bold text-[#6b7c6e] uppercase tracking-widest">{tier.badge}</span>
              <p className="text-3xl font-black my-4">{tier.match}</p>
              <p className="text-[#6b7c6e] text-sm">Pool share: <strong className="text-[#f0f4f1]">{tier.share}</strong></p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED CHARITIES */}
      {featuredCharities && featuredCharities.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Charities we support</h2>
            <p className="text-[#6b7c6e]">Choose who your subscription supports</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {featuredCharities.map(c => (
              <Card key={c.id} hover className="flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-[#4ade80]/10 flex items-center justify-center mb-4">
                  <Heart size={20} className="text-[#4ade80]" />
                </div>
                <h3 className="font-bold text-lg mb-2">{c.name}</h3>
                <p className="text-sm text-[#6b7c6e] flex-1 line-clamp-3">{c.description}</p>
                <Link href={`/charities/${c.id}`} className="mt-4 text-sm text-[#4ade80] hover:underline inline-flex items-center gap-1">
                  Learn more <ArrowRight size={14} />
                </Link>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/charities"><Button variant="outline">View all charities</Button></Link>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="glass rounded-3xl p-12 md:p-16">
          <h2 className="text-3xl md:text-5xl font-black mb-4">
            Ready to make your<br />
            <span className="gradient-text">game count?</span>
          </h2>
          <p className="text-[#6b7c6e] mb-8 max-w-xl mx-auto">
            From £19.99/month. Cancel anytime. Every round you play supports a charity and enters you in the prize draw.
          </p>
          <Link href="/signup">
            <Button size="lg" className="group">
              Start playing for good
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
