import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'Swift Cargo CMS',
    template: '%s | Swift Cargo CMS',
  },
  description: 'Modern courier and shipment management system. Track, manage, and deliver with confidence.',
  keywords: ['cargo', 'logistics', 'shipment', 'tracking', 'courier', 'delivery'],
  authors: [{ name: 'Swift Cargo' }],
  openGraph: {
    title: 'Swift Cargo CMS',
    description: 'Modern courier and shipment management system',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}