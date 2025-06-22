"use client"

import { create } from "zustand"
import type { Category } from "@/types"
import { API_ENDPOINTS } from "@/constants/endpoints"

interface CategoriesStore {
  categories: Category[]
  isLoading: boolean
  error: string | null
  fetchCategories: () => Promise<void>
  getCategoryById: (id: string) => Category | undefined
  getAllCategories: () => Category[] // Flatten all categories including subcategories
  clearError: () => void
}

export const useCategoriesStore = create<CategoriesStore>((set, get) => ({
  categories: [],
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    const { categories } = get()

    // Only fetch if categories are empty
    if (categories.length > 0) return

    try {
      set({ isLoading: true, error: null })

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const response = await fetch(API_ENDPOINTS.INVENTORY.CATEGORIES, {
        method: "GET",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
          "User-Agent": "Mozilla/5.0 (compatible; Admin-Panel/1.0)",
        },
        signal: controller.signal,
        mode: "cors",
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
      }

      const contentType = response.headers.get("content-type")

      // Check if response is HTML (ngrok warning page)
      if (contentType && contentType.includes("text/html")) {
        const htmlContent = await response.text()
        throw new Error(
          "Received HTML response instead of JSON. Please visit the API URL in browser first to bypass ngrok verification.",
        )
      }

      const responseText = await response.text()

      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`)
      }
      set({ categories: data, isLoading: false })
    } catch (error) {
      let errorMessage = "Failed to fetch categories"
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          errorMessage = "Request timed out"
        } else if (error.message.includes("Failed to fetch")) {
          errorMessage = "Network error - possible CORS or connectivity issue"
        } else {
          errorMessage = error.message
        }
      }

      set({
        error: errorMessage,
        isLoading: false,
      })
    }
  },

  getCategoryById: (id: string) => {
    const { categories } = get()

    const findCategory = (cats: Category[]): Category | undefined => {
      for (const cat of cats) {
        if (cat.id === id) return cat
        if (cat.subCategories && cat.subCategories.length > 0) {
          const found = findCategory(cat.subCategories)
          if (found) return found
        }
      }
      return undefined
    }

    return findCategory(categories)
  },

  getAllCategories: () => {
    const { categories } = get()

    const flattenCategories = (cats: Category[]): Category[] => {
      const result: Category[] = []
      for (const cat of cats) {
        result.push(cat)
        if (cat.subCategories && cat.subCategories.length > 0) {
          result.push(...flattenCategories(cat.subCategories))
        }
      }
      return result
    }

    return flattenCategories(categories)
  },

  clearError: () => {
    set({ error: null })
  },
}))
