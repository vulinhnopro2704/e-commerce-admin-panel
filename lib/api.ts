import { API_ENDPOINTS } from "@/constants/endpoints"
import { useAuthStore } from "./auth"
import type { PaginatedResponse, Product, ProductQueryParams } from "@/types"

class ApiClient {
  private getAuthHeaders() {
    const token = useAuthStore.getState().token
    return {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json",
      // ngrok specific headers
      "ngrok-skip-browser-warning": "true",
      "User-Agent": "Mozilla/5.0 (compatible; Admin-Panel/1.0)",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  // Mock delay to simulate API calls
  private async mockDelay(ms = 500) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  private async handleResponse(response: Response) {
    console.log(`API Response: ${response.status} ${response.statusText}`)
    console.log(`Content-Type: ${response.headers.get("content-type")}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`HTTP Error ${response.status}:`, errorText)
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
    }

    const contentType = response.headers.get("content-type")

    // Check if response is HTML (ngrok warning page)
    if (contentType && contentType.includes("text/html")) {
      const htmlContent = await response.text()
      console.error("Received HTML response:", htmlContent.substring(0, 200))
      throw new Error(
        "Received HTML response instead of JSON. This might be due to ngrok verification page. Please visit the API URL in browser first to bypass the warning.",
      )
    }

    // Try to parse as JSON
    const text = await response.text()
    console.log("Raw response:", text.substring(0, 200))

    try {
      return JSON.parse(text)
    } catch (e) {
      console.error("JSON Parse Error:", e)
      throw new Error(`Invalid JSON response: ${text.substring(0, 100)}...`)
    }
  }

  async get(url: string, retries = 2) {
    console.log(`Making GET request to: ${url}`)

    for (let i = 0; i <= retries; i++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

        const response = await fetch(url, {
          method: "GET",
          headers: this.getAuthHeaders(),
          signal: controller.signal,
          mode: "cors", // Explicitly set CORS mode
        })

        clearTimeout(timeoutId)
        return await this.handleResponse(response)
      } catch (error) {
        console.error(`Attempt ${i + 1} failed:`, error)

        if (error instanceof Error) {
          if (error.name === "AbortError") {
            console.error("Request timed out")
          } else if (error.message.includes("Failed to fetch")) {
            console.error("Network error - possible CORS or connectivity issue")
          }
        }

        if (i === retries) {
          // Last retry failed
          console.error(`API call failed after ${retries + 1} attempts:`, error)
          throw error
        }

        // Wait before retry
        await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)))
      }
    }
  }

  async post(url: string, data: any, retries = 1) {
    console.log(`Making POST request to: ${url}`)

    for (let i = 0; i <= retries; i++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000)

        const response = await fetch(url, {
          method: "POST",
          headers: this.getAuthHeaders(),
          body: JSON.stringify(data),
          signal: controller.signal,
          mode: "cors",
        })

        clearTimeout(timeoutId)
        return await this.handleResponse(response)
      } catch (error) {
        console.error(`POST attempt ${i + 1} failed:`, error)

        if (i === retries) {
          console.error(`API call failed after ${retries + 1} attempts:`, error)
          throw error
        }

        await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)))
      }
    }
  }

  async put(url: string, data: any, retries = 1) {
    console.log(`Making PUT request to: ${url}`)

    for (let i = 0; i <= retries; i++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000)

        const response = await fetch(url, {
          method: "PUT",
          headers: this.getAuthHeaders(),
          body: JSON.stringify(data),
          signal: controller.signal,
          mode: "cors",
        })

        clearTimeout(timeoutId)
        return await this.handleResponse(response)
      } catch (error) {
        console.error(`PUT attempt ${i + 1} failed:`, error)

        if (i === retries) {
          console.error(`API call failed after ${retries + 1} attempts:`, error)
          throw error
        }

        await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)))
      }
    }
  }

  async delete(url: string, retries = 1) {
    console.log(`Making DELETE request to: ${url}`)

    for (let i = 0; i <= retries; i++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000)

        const response = await fetch(url, {
          method: "DELETE",
          headers: this.getAuthHeaders(),
          signal: controller.signal,
          mode: "cors",
        })

        clearTimeout(timeoutId)
        return await this.handleResponse(response)
      } catch (error) {
        console.error(`DELETE attempt ${i + 1} failed:`, error)

        if (i === retries) {
          console.error(`API call failed after ${retries + 1} attempts:`, error)
          throw error
        }

        await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)))
      }
    }
  }

  // Dashboard APIs with dummy data
  async getDashboardStats() {
    await this.mockDelay()
    return {
      totalUsers: 1250,
      totalProducts: 340,
      totalOrders: 890,
      totalRevenue: 125000,
      salesByCategory: [
        { category: "Electronics", sales: 45000 },
        { category: "Clothing", sales: 32000 },
        { category: "Books", sales: 18000 },
        { category: "Home & Garden", sales: 25000 },
        { category: "Sports", sales: 15000 },
      ],
      mostSoldProducts: [
        { product: "iPhone 15", quantity: 120 },
        { product: "MacBook Pro", quantity: 85 },
        { product: "AirPods", quantity: 200 },
        { product: "iPad", quantity: 95 },
        { product: "Apple Watch", quantity: 150 },
      ],
    }
  }

  async getMostSoldProducts() {
    await this.mockDelay()
    return [
      { product: "iPhone 15", quantity: 120 },
      { product: "MacBook Pro", quantity: 85 },
      { product: "AirPods", quantity: 200 },
      { product: "iPad", quantity: 95 },
      { product: "Apple Watch", quantity: 150 },
    ]
  }

  async getSalesByCategory() {
    await this.mockDelay()
    return [
      { category: "Electronics", sales: 45000 },
      { category: "Clothing", sales: 32000 },
      { category: "Books", sales: 18000 },
      { category: "Home & Garden", sales: 25000 },
      { category: "Sports", sales: 15000 },
    ]
  }

  // User APIs with dummy data
  async getUsers(params?: Record<string, string>) {
    await this.mockDelay()
    return [
      {
        id: "1",
        email: "john.doe@example.com",
        name: "John Doe",
        role: "user",
        status: "active",
        createdAt: "2024-01-15T10:30:00Z",
        updatedAt: "2024-01-15T10:30:00Z",
      },
      {
        id: "2",
        email: "jane.smith@example.com",
        name: "Jane Smith",
        role: "user",
        status: "active",
        createdAt: "2024-01-14T09:15:00Z",
        updatedAt: "2024-01-14T09:15:00Z",
      },
      {
        id: "3",
        email: "admin@123",
        name: "Admin User",
        role: "admin",
        status: "active",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      },
    ]
  }

  async createUser(userData: any) {
    await this.mockDelay()
    return {
      id: Date.now().toString(),
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }

  async getUserById(id: string) {
    await this.mockDelay()
    return {
      id,
      email: "user@example.com",
      name: "Sample User",
      role: "user",
      status: "active",
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-01-15T10:30:00Z",
    }
  }

  async deleteUser(id: string) {
    await this.mockDelay()
    return { success: true }
  }

  // Category APIs - Real API calls with retry
  async getCategories() {
    return this.get(API_ENDPOINTS.INVENTORY.CATEGORIES, 2) // Retry up to 2 times
  }

  async createCategory(categoryData: any) {
    return this.post(API_ENDPOINTS.INVENTORY.CATEGORIES, categoryData, 1)
  }

  // Product APIs - Real API calls with retry
  async getProducts(params?: ProductQueryParams): Promise<PaginatedResponse<Product>> {
    const url = new URL(API_ENDPOINTS.SHOPPING.PRODUCTS)

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          url.searchParams.append(key, value.toString())
        }
      })
    }

    return this.get(url.toString(), 2) // Retry up to 2 times
  }

  async createProduct(productData: any) {
    return this.post(API_ENDPOINTS.INVENTORY.PRODUCTS, productData, 1)
  }

  async updateProduct(id: string, productData: any) {
    return this.put(API_ENDPOINTS.INVENTORY.PRODUCT_BY_ID(id), productData, 1)
  }

  async deleteProduct(id: string) {
    return this.delete(API_ENDPOINTS.INVENTORY.PRODUCT_BY_ID(id), 1)
  }
}

export const apiClient = new ApiClient()
