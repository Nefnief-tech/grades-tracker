// ROOT LAYOUT BYPASS - Check if this exists and comment out auth providers
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Grade Tracker V2',
  description: 'Track your academic progress',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* TEMPORARILY REMOVED AUTH PROVIDERS TO STOP REDIRECTS */}
        {/* <AuthProvider> */}
        {/* <AnalyticsProvider> */}
          {children}
        {/* </AnalyticsProvider> */}
        {/* </AuthProvider> */}
      </body>
    </html>
  )
}