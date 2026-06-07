import { cn } from '@/lib/utils'

type BadgeVariant = 'active' | 'inactive' | 'pending' | 'approved' | 'rejected' | 'paid' | 'draft' | 'published' | 'default'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

const variants: Record<BadgeVariant, string> = {
  active: 'bg-green-500/10 text-green-400 border-green-500/20',
  inactive: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  approved: 'bg-green-500/10 text-green-400 border-green-500/20',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
  paid: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  draft: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  published: 'bg-green-500/10 text-green-400 border-green-500/20',
  default: 'bg-[#1e2d24] text-[#6b7c6e] border-[#1e2d24]',
}

export default function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border', variants[variant], className)}>
      {children}
    </span>
  )
}
