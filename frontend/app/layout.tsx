import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import NotificationProviderWrapper from '../components/NotificationProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Dhugaa Media - Oromo Content Platform',
  description: 'Premier digital media platform for Oromo content worldwide',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NotificationProviderWrapper>
          {children}
        </NotificationProviderWrapper>
      </body>
    </html>
  )
}

