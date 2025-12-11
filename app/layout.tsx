import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AirBook - Airline Ticket Reservation System',
  description: 'Find and book your perfect flight with AirBook'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
