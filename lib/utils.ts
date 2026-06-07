import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(pence: number) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(pence / 100)
}

export function formatPounds(pounds: number) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(pounds)
}

export function formatMonth(month: string) {
  const [year, m] = month.split('-')
  return new Date(parseInt(year), parseInt(m) - 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

export function currentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

// Draw engine: generate 5 random numbers from 1-45
export function generateRandomDraw(): number[] {
  const nums = new Set<number>()
  while (nums.size < 5) {
    nums.add(Math.floor(Math.random() * 45) + 1)
  }
  return Array.from(nums).sort((a, b) => a - b)
}

// Draw engine: algorithmic — weighted inverse of frequency
export function generateAlgorithmicDraw(
  allScores: number[],
  totalUsers: number
): number[] {
  const freq: Record<number, number> = {}
  for (let i = 1; i <= 45; i++) freq[i] = 0
  allScores.forEach(s => { freq[s] = (freq[s] || 0) + 1 })

  // Weight inversely to frequency — rarer scores more likely to be drawn
  const weights: number[] = []
  const keys: number[] = []
  for (let i = 1; i <= 45; i++) {
    keys.push(i)
    weights.push(totalUsers + 1 - (freq[i] || 0))
  }

  const totalWeight = weights.reduce((a, b) => a + b, 0)
  const result = new Set<number>()

  while (result.size < 5) {
    let rand = Math.random() * totalWeight
    for (let i = 0; i < keys.length; i++) {
      rand -= weights[i]
      if (rand <= 0) { result.add(keys[i]); break }
    }
  }

  return Array.from(result).sort((a, b) => a - b)
}

// Count matching numbers between user scores and drawn numbers
export function countMatches(userScores: number[], drawnNumbers: number[]): number {
  return userScores.filter(s => drawnNumbers.includes(s)).length
}

// Calculate pool for each tier given total pool and jackpot rollover
export function calculatePrizePools(totalPool: number, jackpotRollover: number) {
  return {
    5: totalPool * 0.40 + jackpotRollover,
    4: totalPool * 0.35,
    3: totalPool * 0.25,
  }
}
