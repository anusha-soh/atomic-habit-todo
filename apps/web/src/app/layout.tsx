import type { Metadata } from 'next'
import { Caveat, Patrick_Hand, Inter } from 'next/font/google'
import './globals.css'
import { ToastProvider } from '@/lib/toast-context'
import { Navbar } from '@/components/Navbar'

const caveat = Caveat({ subsets: ['latin'], variable: '--font-caveat-var' })
const patrickHand = Patrick_Hand({ weight: '400', subsets: ['latin'], variable: '--font-patrick-hand-var' })
const inter = Inter({ subsets: ['latin'], variable: '--font-inter-var' })

export const metadata: Metadata = {
  title: 'Atomic Habits - Phase 2',
  description: 'Todo and Habits Tracker - Core Infrastructure',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${caveat.variable} ${patrickHand.variable} ${inter.variable} min-h-screen antialiased`}>
        <ToastProvider>
          <Navbar />
          <main className="pb-20 md:pb-8 mx-auto max-w-[1200px]">
            {children}
          </main>
        </ToastProvider>
      </body>
    </html>
  )
}
