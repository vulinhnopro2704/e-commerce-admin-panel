import { API_ENDPOINTS } from "@/constants/endpoints"
import type {
  PaginatedResponse,
  Product,
  ProductQueryParams,
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
} from "@/types"
import { isAdminUser, isTokenExpired } from "./jwt-utils"

// Utility functions for camelCase conversion
function toCamel(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1)
}

function keysToCamel<T>(obj: any): T {
  if (Array.isArray(obj)) return obj.map((v) => keysToCamel(v)) as any
  if (obj !== null && obj.constructor === Object) {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      acc[toCamel(key)] = keysToCamel(value)
      return acc
    }, {} as any) as T
  }
  return obj
}

class ApiClient {
  private getTokens() {
    if (typeof window === "undefined") return { accessToken: null, refreshToken: null }

    const accessToken = localStorage.getItem("accessToken")
    const refreshToken = localStorage.getItem("refreshToken")
    return { accessToken, refreshToken }
  }

  private saveTokens(accessToken: string, refreshToken: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", accessToken)
      localStorage.setItem("refreshToken", refreshToken)
    }
  }

  private clearTokens() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
    }
  }

  private getAuthHeaders(skipAuth = false) {
    const headers: Record<string, string> = {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
      "User-Agent": "Mozilla/5.0 (compatible; Admin-Panel/1.0)",
    }

    if (!skipAuth) {
      const { accessToken } = this.getTokens()
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`
      }
    }

    return headers
  }

  private async refreshAccessToken(): Promise<string> {
    const { refreshToken } = this.getTokens()

    if (!refreshToken) {
      throw new Error("No refresh token available")
    }

    console.log("Refreshing access token...")

    const response = await fetch(API_ENDPOINTS.IDENTITY.REFRESH_TOKEN, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({ refreshToken }),
    })

    if (!response.ok) {
      console.error("Token refresh failed:", response.status)
      this.clearTokens()
      if (typeof window !== "undefined") {
        window.location.href = "/login"
      }
      throw new Error("Token refresh failed")
    }

    const data: RefreshTokenResponse = await response.json()

    // Validate the new access token
    if (!isAdminUser(data.accessToken)) {
      console.error("Refreshed token does not have admin role")
      this.clearTokens()
      if (typeof window !== "undefined") {
        window.location.href = "/login"
      }
      throw new Error("Access denied: Admin role required")
    }

    this.saveTokens(data.accessToken, data.refreshToken)

    console.log("Token refreshed successfully")
    return data.accessToken
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    console.log(`API Response: ${response.status} ${response.statusText}`)
    console.log(`Content-Type: ${response.headers.get("content-type")}`)

    const contentType = response.headers.get("content-type")

    // Check if response is HTML (ngrok warning page)
    if (contentType && contentType.includes("text/html")) {
      const htmlContent = await response.text()
      console.error("Received HTML response:", htmlContent.substring(0, 200))
      throw new Error(
        "Received HTML response instead of JSON. Please visit the API URL in browser first to bypass ngrok verification.",
      )
    }

    // Try to parse as JSON
    const text = await response.text()
    console.log("Raw response:", text.substring(0, 200))

    let data: any
    try {
      data = JSON.parse(text)
    } catch (e) {
      console.error("JSON Parse Error:", e)
      throw new Error(`Invalid JSON response: ${text.substring(0, 100)}...`)
    }

    // Convert keys to camelCase
    data = keysToCamel(data)

    if (!response.ok) {
      console.error(`HTTP Error ${response.status}:`, data)
      throw new Error(`HTTP error! status: ${response.status} - ${data.msgNo || response.statusText}`)
    }

    return data as T
  }

  private async fetchWithAuth<T>(url: string, options: RequestInit = {}, skipAuth = false, retries = 1): Promise<T> {
    console.log(`Making ${options.method || "GET"} request to: ${url}`)

    for (let i = 0; i <= retries; i++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

        const response = await fetch(url, {
          ...options,
          headers: {
            ...this.getAuthHeaders(skipAuth),
            ...options.headers,
          },
          signal: controller.signal,
          mode: "cors",
        })

        clearTimeout(timeoutId)

        // Handle 401 Unauthorized - try to refresh token
        if (response.status === 401 && !skipAuth) {
          console.log("Received 401, attempting token refresh...")

          try {
            const newAccessToken = await this.refreshAccessToken()

            // Retry the original request with new token
            const retryResponse = await fetch(url, {
              ...options,
              headers: {
                ...this.getAuthHeaders(false), // Use new token
                ...options.headers,
              },
              signal: controller.signal,
              mode: "cors",
            })

            return await this.handleResponse<T>(retryResponse)
          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError)
            this.clearTokens()
            if (typeof window !== "undefined") {
              window.location.href = "/login"
            }
            throw refreshError
          }
        }

        return await this.handleResponse<T>(response)
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
          console.error(`API call failed after ${retries + 1} attempts:`, error)
          throw error
        }

        // Wait before retry
        await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)))
      }
    }

    throw new Error("Unexpected error in fetchWithAuth")
  }

  // Auth APIs
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    console.log("Attempting login...")

    const response = await this.fetchWithAuth<LoginResponse>(
      API_ENDPOINTS.IDENTITY.LOGIN,
      {
        method: "POST",
        body: JSON.stringify(credentials),
      },
      true, // Skip auth for login
      2, // Retry up to 2 times
    )

    // Validate the access token before saving
    if (!isAdminUser(response.token.accessToken)) {
      throw new Error("Access denied: Admin role required")
    }

    if (isTokenExpired(response.token.accessToken)) {
      throw new Error("Received expired token")
    }

    // Save tokens after successful validation
    this.saveTokens(response.token.accessToken, response.token.refreshToken)
    console.log("Login successful, tokens saved")

    return response
  }

  logout() {
    console.log("Logging out...")
    this.clearTokens()
  }

  // Mock delay to simulate API calls
  private async mockDelay(ms = 500) {
    return new Promise((resolve) => setTimeout(resolve, ms))
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
    return this.fetchWithAuth(API_ENDPOINTS.INVENTORY.CATEGORIES, { method: "GET" }, false, 2)
  }

  async createCategory(categoryData: any) {
    return this.fetchWithAuth(
      API_ENDPOINTS.INVENTORY.CATEGORIES,
      {
        method: "POST",
        body: JSON.stringify(categoryData),
      },
      false,
      1,
    )
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

    return this.fetchWithAuth(url.toString(), { method: "GET" }, false, 2)
  }

  async getProductById(id: string): Promise<Product> {
    return this.fetchWithAuth(API_ENDPOINTS.SHOPPING.PRODUCT_BY_ID(id), { method: "GET" }, false, 2)
  }

  async createProduct(productData: any) {
    return this.fetchWithAuth(
      API_ENDPOINTS.INVENTORY.PRODUCTS,
      {
        method: "POST",
        body: JSON.stringify(productData),
      },
      false,
      1,
    )
  }

  async updateProduct(id: string, productData: any) {
    return this.fetchWithAuth(
      API_ENDPOINTS.INVENTORY.PRODUCT_BY_ID(id),
      {
        method: "PUT",
        body: JSON.stringify(productData),
      },
      false,
      1,
    )
  }

  async deleteProduct(id: string) {
    return this.fetchWithAuth(API_ENDPOINTS.INVENTORY.PRODUCT_BY_ID(id), { method: "DELETE" }, false, 1)
  }
}

export const apiClient = new ApiClient()
