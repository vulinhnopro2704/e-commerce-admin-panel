import type React from "react"
import "./globals.css"
import "../styles/globals.css"
import { Inter } from "next/font/google"
import { DM_Sans } from "next/font/google"
import ClientLayout from "./clientLayout"
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"] })

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${dmSans.className}`}>
        <ClientLayout>{children}</ClientLayout>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}

export const metadata = {
  title: 'SUPERBAD.STORE Admin Panel',
  description: 'Admin management dashboard for SUPERBAD.STORE e-commerce platform',
  keywords: 'admin, dashboard, e-commerce, management, superbad, store, superbad.store',
  authors: [{ name: 'Phạm Hồng Phúc' }],
  creator: 'SUPERBAD.STORE',
  publisher: 'SUPERBAD.STORE',
  colorScheme: 'dark light',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#7c3aed' },
    { media: '(prefers-color-scheme: dark)', color: '#4c1d95' }
  ],
  openGraph: {
    title: 'SUPERBAD.STORE Admin Panel',
    description: 'Admin management dashboard for SUPERBAD.STORE e-commerce platform',
    url: 'https://admin-superbad-store.vercel.app/',
    siteName: 'SUPERBAD.STORE Admin',
    locale: 'en_US',
    type: 'website',
  },
  metadataBase: new URL('https://admin-superbad-store.vercel.app/'),
};
