import type { Metadata } from 'next'
import './globals.css'

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
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  )
}
