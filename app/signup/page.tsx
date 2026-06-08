'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import toast from 'react-hot-toast'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })
    setLoading(false)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Account created! Now choose your charity.')
      router.refresh()
      router.push('/signup/select-charity')
    }
  }

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-black">⛳ Golf<span className="text-[#4ade80]">Gives</span></Link>
          <h1 className="text-2xl font-bold mt-6 mb-2">Create your account</h1>
          <p className="text-[#6b7c6e] text-sm">Start playing for good</p>
        </div>

        <div className="glass rounded-2xl p-8">
          <form onSubmit={handleSignup} className="flex flex-col gap-5">
            <Input
              id="name"
              label="Full name"
              type="text"
              placeholder="John Smith"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
            <Input
              id="email"
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <Input
              id="password"
              label="Password"
              type="password"
              placeholder="Min. 8 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <Button type="submit" loading={loading} size="lg" className="mt-2">
              Create account
            </Button>
          </form>

          <p className="text-center text-sm text-[#6b7c6e] mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-[#4ade80] hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
