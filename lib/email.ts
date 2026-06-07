import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'Golf Charity Platform <onboarding@resend.dev>'

export async function sendDrawResultEmail(
  to: string,
  name: string,
  drawMonth: string,
  drawnNumbers: number[],
  isWinner: boolean,
  matchType?: number,
  prize?: number
) {
  const subject = isWinner
    ? `You won in the ${drawMonth} draw!`
    : `${drawMonth} draw results are in`

  const body = isWinner
    ? `Congratulations ${name}! You matched ${matchType} numbers in the ${drawMonth} draw and won £${prize?.toFixed(2)}. Please log in to submit your proof of score to claim your prize.`
    : `The ${drawMonth} draw has been completed. The winning numbers were: ${drawnNumbers.join(', ')}. Better luck next month!`

  return resend.emails.send({ from: FROM, to, subject, text: body })
}

export async function sendWinnerVerificationEmail(
  to: string,
  name: string,
  status: 'approved' | 'rejected',
  prize?: number,
  note?: string
) {
  const subject = status === 'approved'
    ? 'Your prize claim has been approved!'
    : 'Your prize claim requires attention'

  const body = status === 'approved'
    ? `Great news ${name}! Your prize claim has been approved. Your payment of £${prize?.toFixed(2)} will be processed shortly.`
    : `Hi ${name}, your prize claim submission has been reviewed. Unfortunately it was not approved at this time. ${note ? `Note from admin: ${note}` : ''} Please contact support if you have questions.`

  return resend.emails.send({ from: FROM, to, subject, text: body })
}

export async function sendSubscriptionEmail(
  to: string,
  name: string,
  type: 'welcome' | 'cancelled' | 'renewed' | 'lapsed'
) {
  const subjects = {
    welcome: 'Welcome to Golf Charity Platform!',
    cancelled: 'Your subscription has been cancelled',
    renewed: 'Your subscription has been renewed',
    lapsed: 'Your subscription has lapsed',
  }
  const bodies = {
    welcome: `Welcome ${name}! Your subscription is now active. Start entering your golf scores and take part in the monthly draw.`,
    cancelled: `Hi ${name}, your subscription has been cancelled. You'll retain access until the end of your current billing period.`,
    renewed: `Hi ${name}, your subscription has been successfully renewed. Keep entering those scores!`,
    lapsed: `Hi ${name}, your subscription has lapsed due to a failed payment. Please update your payment details to continue participating.`,
  }
  return resend.emails.send({ from: FROM, to, subject: subjects[type], text: bodies[type] })
}
