'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Users, Trophy, Heart, ShieldCheck, BarChart2, LayoutDashboard } from 'lucide-react'

const links = [
  { href: '/admin', label: 'Overview', icon: <LayoutDashboard size={16} /> },
  { href: '/admin/users', label: 'Users', icon: <Users size={16} /> },
  { href: '/admin/draws', label: 'Draws', icon: <Trophy size={16} /> },
  { href: '/admin/charities', label: 'Charities', icon: <Heart size={16} /> },
  { href: '/admin/winners', label: 'Winners', icon: <ShieldCheck size={16} /> },
  { href: '/admin/reports', label: 'Reports', icon: <BarChart2 size={16} /> },
]

export default function AdminNav() {
  const pathname = usePathname()
  return (
    <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
      {links.map(l => {
        const active = pathname === l.href
        return (
          <Link key={l.href} href={l.href}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              active ? 'bg-[#d4a017]/10 text-[#d4a017]' : 'text-[#6b7c6e] hover:text-[#f0f4f1] hover:bg-[#111816]'
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
