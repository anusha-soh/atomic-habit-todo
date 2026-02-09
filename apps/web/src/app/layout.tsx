import type { Metadata } from 'next'
import './globals.css'
import { ToastProvider } from '@/lib/toast-context'
import { Navbar } from '@/components/Navbar'

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
      <body className="min-h-screen bg-gray-50 text-foreground antialiased">
        <ToastProvider>
          <Navbar />
          <main className="pb-20 md:pb-8">
            {children}
          </main>
        </ToastProvider>
      </body>
    </html>
  )
}
