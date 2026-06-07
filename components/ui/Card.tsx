import { cn } from '@/lib/utils'

interface CardProps {
  className?: string
  children: React.ReactNode
  hover?: boolean
}

export default function Card({ className, children, hover }: CardProps) {
  return (
    <div className={cn(
      'bg-[#111816] border border-[#1e2d24] rounded-2xl p-6',
      hover && 'transition-all duration-300 hover:border-[#4ade80]/30 hover:shadow-lg hover:shadow-[#4ade80]/5',
      className
    )}>
      {children}
    </div>
  )
}

export function CardHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('mb-4', className)}>{children}</div>
}

export function CardTitle({ className, children }: { className?: string; children: React.ReactNode }) {
  return <h3 className={cn('text-lg font-bold text-[#f0f4f1]', className)}>{children}</h3>
}
