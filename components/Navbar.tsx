'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Button from './ui/Button'
import { Menu, X } from 'lucide-react'

interface NavbarProps {
  user?: { email?: string } | null
  isAdmin?: boolean
  isSubscriber?: boolean
}

export default function Navbar({ user, isAdmin, isSubscriber }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/charities', label: 'Charities' },
    { href: '/donate', label: 'Donate' },
    ...(user ? [{ href: '/dashboard', label: 'Dashboard' }] : []),
    ...(isAdmin ? [{ href: '/admin', label: 'Admin' }] : []),
  ]

  return (
    <nav className="sticky top-0 z-50 glass border-b border-[#1e2d24]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">⛳</span>
            <span className="font-bold text-[#f0f4f1]">
              Golf<span className="text-[#4ade80]">Gives</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(l => (
              <Link
                key={l.href}
                href={l.href}
                className={`text-sm font-medium transition-colors ${pathname === l.href ? 'text-[#4ade80]' : 'text-[#6b7c6e] hover:text-[#f0f4f1]'}`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <span className="text-xs text-[#6b7c6e]">{user.email}</span>
                <Button variant="outline" size="sm" onClick={signOut}>Sign out</Button>
              </>
            ) : (
              <>
                <Link href="/login"><Button variant="ghost" size="sm">Log in</Button></Link>
                <Link href="/signup"><Button size="sm">Get started</Button></Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden text-[#6b7c6e]" onClick={() => setOpen(!open)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-[#1e2d24] bg-[#0a0f0d] px-4 py-4 flex flex-col gap-3">
          {navLinks.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              className={`text-sm font-medium py-2 ${pathname === l.href ? 'text-[#4ade80]' : 'text-[#6b7c6e]'}`}>
              {l.label}
            </Link>
          ))}
          {user ? (
            <Button variant="outline" size="sm" onClick={signOut} className="mt-2">Sign out</Button>
          ) : (
            <div className="flex gap-2 mt-2">
              <Link href="/login" className="flex-1"><Button variant="outline" size="sm" className="w-full">Log in</Button></Link>
              <Link href="/signup" className="flex-1"><Button size="sm" className="w-full">Get started</Button></Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
