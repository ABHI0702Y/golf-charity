import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

export default function SubscribeSuccessPage() {
  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-[#4ade80]/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-[#4ade80]" />
        </div>
        <h1 className="text-3xl font-black mb-3">You&apos;re in!</h1>
        <p className="text-[#6b7c6e] mb-8">
          Your subscription is active. Head to your dashboard to enter your golf scores and choose your charity.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0a0f0d] bg-[#4ade80] text-[#0a0f0d] hover:bg-[#22c55e] focus:ring-[#4ade80] px-7 py-3.5 text-base"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  )
}
