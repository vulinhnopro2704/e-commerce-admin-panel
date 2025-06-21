"use client"
import type { AuthState, User } from "@/types"
import { create } from "zustand"
import { persist } from "zustand/middleware"

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  setUser: (user: User) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        try {
          // Simulate API delay
          await new Promise((resolve) => setTimeout(resolve, 1000))

          // Mock authentication - accept admin credentials or any user@example.com
          if ((email === "admin@123" && password === "Admin@123") || email.includes("@example.com")) {
            const mockUser = {
              id: "1",
              name: email === "admin@123" ? "Admin User" : "Demo User",
              email: email,
              role: email === "admin@123" ? "admin" : "user",
              status: "active",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }

            const mockToken = "mock-jwt-token-" + Date.now()

            set({
              user: mockUser,
              token: mockToken,
              isAuthenticated: true,
            })
            return true
          }
          return false
        } catch (error) {
          console.error("Login error:", error)
          return false
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
      },

      setUser: (user: User) => {
        set({ user })
      },
    }),
    {
      name: "auth-storage",
    },
  ),
)
