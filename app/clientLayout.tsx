"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Inter } from "next/font/google"
import { useAuthStore } from "@/lib/auth"
import { useCategoriesStore } from "@/lib/categories-store"
import Sidebar from "@/components/layout/sidebar"
import Header from "@/components/layout/header"

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
      checkAuth()
    } catch (error) {
    }
  }, [checkAuth])

  useEffect(() => {
    if (!isAuthenticated && pathname !== "/login") {
      router.push("/login")
    } else if (isAuthenticated && pathname === "/login") {
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
        <body className={inter.className}>
          <div className="min-h-screen bg-white">
            <div className="fixed top-5 left-0 w-full text-center">
              <div className="inline-block font-bold text-3xl text-transparent bg-clip-text bg-gradient-to-r from-black to-purple-800 tracking-wider">
                SUPERBAD.STORE
              </div>
            </div>
            {children}
          </div>
        </body>
      </html>
    )
  }

  if (!isAuthenticated) {
    return (
      <html lang="en">
        <body className={inter.className}>
          <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="font-bold text-3xl text-transparent bg-clip-text bg-gradient-to-r from-black to-purple-800 tracking-wider mb-8">
                SUPERBAD.STORE
              </div>
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto"></div>
              <p className="text-purple-600 text-sm">Loading admin panel...</p>
            </div>
          </div>
        </body>
      </html>
    )
  }

  // Get page title from pathname
  const getPageTitle = () => {
    if (pathname === "/") return "Dashboard";
    return pathname.slice(1).charAt(0).toUpperCase() + pathname.slice(2);
  };

  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-screen bg-gray-50">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header title={getPageTitle()} />
            <main className="flex-1 overflow-auto bg-gray-50 p-6">{children}</main>
          </div>
        </div>
      </body>
    </html>
  )
}
