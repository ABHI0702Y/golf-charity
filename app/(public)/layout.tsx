import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let isAdmin = false
  let isSubscriber = false

  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const { data: sub } = await supabase.from('subscriptions').select('status').eq('user_id', user.id).single()
    isAdmin = profile?.role === 'admin'
    isSubscriber = sub?.status === 'active'
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} isAdmin={isAdmin} isSubscriber={isSubscriber} />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-[#1e2d24] py-8 text-center text-sm text-[#6b7c6e]">
        <div className="max-w-7xl mx-auto px-4">
          <p>© {new Date().getFullYear()} GolfGives · Play. Give. Win. · All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
