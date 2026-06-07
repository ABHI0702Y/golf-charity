'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Target, Heart, Trophy, CreditCard } from 'lucide-react'

const links = [
  { href: '/dashboard', label: 'Overview', icon: <LayoutDashboard size={16} /> },
  { href: '/dashboard/scores', label: 'My Scores', icon: <Target size={16} /> },
  { href: '/dashboard/charity', label: 'My Charity', icon: <Heart size={16} /> },
  { href: '/dashboard/draws', label: 'Draws', icon: <Trophy size={16} /> },
  { href: '/dashboard/subscription', label: 'Subscription', icon: <CreditCard size={16} /> },
]

export default function DashboardNav() {
  const pathname = usePathname()
  return (
    <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
      {links.map(l => {
        const active = pathname === l.href
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              active
                ? 'bg-[#4ade80]/10 text-[#4ade80]'
                : 'text-[#6b7c6e] hover:text-[#f0f4f1] hover:bg-[#111816]'
            }`}
          >
            {l.icon}
            {l.label}
          </Link>
        )
      })}
    </nav>
  )
}
