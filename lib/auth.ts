"use client"
import type { AuthState, User, LoginRequest } from "@/types"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { apiClient } from "./api"
import { getUserFromToken, isAdminUser, isTokenExpired } from "./jwt-utils"

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  setUser: (user: User) => void
  checkAuth: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        try {
          console.log("Attempting login with API...")

          const credentials: LoginRequest = { email, password }
          const response = await apiClient.login(credentials)

          console.log("Login response:", response)

          const accessToken = response.token.accessToken

          // Decode JWT to get user information
          const decodedUser = getUserFromToken(accessToken)

          if (!decodedUser) {
            console.error("Failed to decode JWT token")
            return {
              success: false,
              error: "Invalid token received from server",
            }
          }

          console.log("Decoded user from JWT:", decodedUser)

          // Check if user has admin role
          if (!isAdminUser(accessToken)) {
            console.error("User does not have admin role:", decodedUser.role)

            // Clear tokens since user is not admin
            apiClient.logout()

            return {
              success: false,
              error: `Access denied. Admin role required. Your role: ${decodedUser.role}`,
            }
          }

          // Check if token is expired
          if (isTokenExpired(accessToken)) {
            console.error("Token is expired")
            return {
              success: false,
              error: "Token is expired",
            }
          }

          // Create user object from JWT claims
          const user: User = {
            id: decodedUser.id,
            name: decodedUser.email === "admin@123" ? "Admin User" : "Admin",
            email: decodedUser.email,
            role: decodedUser.role.toLowerCase() as "admin" | "user",
            status: "active",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }

          set({
            user: user,
            token: accessToken,
            isAuthenticated: true,
          })

          console.log("Login successful, user state updated")
          return { success: true }
        } catch (error) {
          console.error("Login error:", error)

          // Clear any existing auth state on login failure
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          })

          // Return specific error message
          if (error instanceof Error) {
            if (error.message.includes("401") || error.message.includes("Unauthorized")) {
              return {
                success: false,
                error: "Invalid email or password",
              }
            } else if (error.message.includes("Failed to fetch") || error.message.includes("Network error")) {
              return {
                success: false,
                error: "Network error. Please check your connection and try again.",
              }
            } else {
              return {
                success: false,
                error: error.message,
              }
            }
          }

          return {
            success: false,
            error: "An unexpected error occurred. Please try again.",
          }
        }
      },

      logout: () => {
        console.log("Logging out...")
        apiClient.logout()
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
      },

      setUser: (user: User) => {
        set({ user })
      },

      checkAuth: () => {
        // Check if we have tokens in localStorage
        if (typeof window !== "undefined") {
          const accessToken = localStorage.getItem("accessToken")
          const refreshToken = localStorage.getItem("refreshToken")

          console.log("CheckAuth - Tokens found:", { 
            accessToken: accessToken ? "exists" : "missing", 
            refreshToken: refreshToken ? "exists" : "missing" 
          })

          if (accessToken && refreshToken) {
            // Validate the access token
            const decodedUser = getUserFromToken(accessToken)
            const isAdmin = isAdminUser(accessToken)
            const isExpired = isTokenExpired(accessToken)
            
            console.log("CheckAuth - Token validation:", { 
              decodedUser: decodedUser ? "valid" : "invalid",
              isAdmin: isAdmin ? "yes" : "no",
              isExpired: isExpired ? "yes" : "no"
            })

            if (decodedUser && isAdmin && !isExpired) {
              const currentState = get()
              if (!currentState.isAuthenticated) {
                // Restore auth state if tokens are valid
                const user: User = {
                  id: decodedUser.id,
                  name: decodedUser.email === "admin@123" ? "Admin User" : "Admin",
                  email: decodedUser.email,
                  role: decodedUser.role.toLowerCase() as "admin" | "user",
                  status: "active",
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                }

                set({
                  user: user,
                  token: accessToken,
                  isAuthenticated: true,
                })

                console.log("Auth state restored from valid tokens")
              }
            } else if (decodedUser && isAdmin && isExpired) {
              // Token is expired but otherwise valid, try to refresh
              console.log("Token expired, attempting to refresh...")
              
              // Implement token refresh logic here
              // For now, we'll just log out the user
              localStorage.removeItem("accessToken")
              localStorage.removeItem("refreshToken")
              set({
                user: null,
                token: null,
                isAuthenticated: false,
              })
            } else {
              // Clear invalid tokens with more specific logging
              console.log("Invalid tokens found, clearing auth state. Issues:", {
                noDecodedUser: !decodedUser,
                notAdmin: !isAdmin,
                expired: isExpired
              })
              
              localStorage.removeItem("accessToken")
              localStorage.removeItem("refreshToken")
              set({
                user: null,
                token: null,
                isAuthenticated: false,
              })
            }
          } else {
            // Clear auth state if no tokens
            console.log("No tokens found in localStorage, clearing auth state")
            set({
              user: null,
              token: null,
              isAuthenticated: false,
            })
          }
        }
      },
    }),
    {
      name: "auth-storage",
      // Only persist user data, not tokens (tokens are in localStorage separately)
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)
