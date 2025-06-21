import type React from "react"
import "./globals.css"
import "../styles/globals.css"
import { Inter } from "next/font/google"
import { DM_Sans } from "next/font/google"
import ClientLayout from "./clientLayout"

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
      </body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.dev'
    };
