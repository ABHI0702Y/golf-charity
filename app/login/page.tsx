'use client'
import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import toast from 'react-hot-toast'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Welcome back!')
      router.refresh()
      router.push(redirectTo)
    }
  }

  return (
    <div className="glass rounded-2xl p-8">
      <form onSubmit={handleLogin} className="flex flex-col gap-5">
        <Input id="email" label="Email address" type="email" placeholder="you@example.com"
          value={email} onChange={e => setEmail(e.target.value)} required />
        <Input id="password" label="Password" type="password" placeholder="••••••••"
          value={password} onChange={e => setPassword(e.target.value)} required />
        <Button type="submit" loading={loading} size="lg" className="mt-2">Sign in</Button>
      </form>
      <p className="text-center text-sm text-[#6b7c6e] mt-6">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-[#4ade80] hover:underline font-medium">Create one</Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-black">⛳ Golf<span className="text-[#4ade80]">Gives</span></Link>
          <h1 className="text-2xl font-bold mt-6 mb-2">Welcome back</h1>
          <p className="text-[#6b7c6e] text-sm">Sign in to access your dashboard</p>
        </div>
        <Suspense fallback={<div className="glass rounded-2xl p-8 text-center text-[#6b7c6e]">Loading…</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
