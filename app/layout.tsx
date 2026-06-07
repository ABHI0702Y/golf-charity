import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Golf Charity Platform — Play. Give. Win.',
  description: 'Subscribe to play golf, support charities, and win monthly prizes. A modern platform where your game makes a difference.',
  openGraph: {
    title: 'Golf Charity Platform',
    description: 'Play golf. Support charity. Win monthly prizes.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-[#0a0f0d] text-[#f0f4f1] antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#111816', color: '#f0f4f1', border: '1px solid #1e2d24' },
            success: { iconTheme: { primary: '#4ade80', secondary: '#111816' } },
            error: { iconTheme: { primary: '#f87171', secondary: '#111816' } },
          }}
        />
      </body>
    </html>
  )
}
