import type { Metadata } from 'next'
import { Caveat, Patrick_Hand, Inter } from 'next/font/google'
import './globals.css'
import { ToastProvider } from '@/lib/toast-context'
import { Navbar } from '@/components/Navbar'
import { ClientMain } from '@/components/ClientMain'
import { UserProvider } from '@/contexts/user-context'

const caveat = Caveat({ subsets: ['latin'], variable: '--font-caveat-var' })
const patrickHand = Patrick_Hand({ weight: '400', subsets: ['latin'], variable: '--font-patrick-hand-var' })
const inter = Inter({ subsets: ['latin'], variable: '--font-inter-var' })

export const metadata: Metadata = {
  title: 'Atomic Habits — Build Better Habits, One Day at a Time',
  description: 'A cozy notebook-inspired app for building lasting habits and tracking your daily tasks.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${caveat.variable} ${patrickHand.variable} ${inter.variable} min-h-screen antialiased`}>
        <UserProvider>
          <ToastProvider>
            <Navbar />
            <ClientMain>
              {children}
            </ClientMain>
          </ToastProvider>
        </UserProvider>
      </body>
    </html>
  )
}
