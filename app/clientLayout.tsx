"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Inter } from "next/font/google"
import { useAuthStore } from "@/lib/auth"
import { useCategoriesStore } from "@/lib/categories-store"
import Sidebar from "@/components/layout/sidebar"

const inter = Inter({ subsets: ["latin"] })

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, checkAuth } = useAuthStore()
  const { fetchCategories } = useCategoriesStore()
  const router = useRouter()
  const pathname = usePathname()

  // Check auth status on app load with better error handling
  useEffect(() => {
    try {
      console.log("ClientLayout - Checking authentication state")
      checkAuth()
      console.log(
        "ClientLayout - Auth check complete, isAuthenticated:",
        isAuthenticated
      )
    } catch (error) {
      console.error("Error during authentication check:", error)
    }
  }, [checkAuth])

  useEffect(() => {
    if (!isAuthenticated && pathname !== "/login") {
      console.log(
        "Not authenticated, redirecting to login page from:",
        pathname
      )
      router.push("/login")
    } else if (isAuthenticated && pathname === "/login") {
      console.log("Already authenticated, redirecting to dashboard")
      router.push("/")
    }
  }, [isAuthenticated, pathname, router])

  // Fetch categories when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCategories()
    }
  }, [isAuthenticated, fetchCategories])

  if (pathname === "/login") {
    return (
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>
    )
  }

  if (!isAuthenticated) {
    return (
      <html lang="en">
        <body className={inter.className}>
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
          </div>
        </body>
      </html>
    )
  }

  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-screen bg-gray-50">
          <Sidebar />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </body>
    </html>
  )
}
