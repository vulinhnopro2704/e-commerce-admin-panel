// Update with your actual ngrok URL
const BASE_URL = 'https://62c1-116-110-82-126.ngrok-free.app'
export const API_ENDPOINTS = {
  // Identity Service
  IDENTITY: {
    LOGIN: `${BASE_URL}/api/identity/auth/login`,
    USERS: `${BASE_URL}/api/identity/users`,
    REFRESH_TOKEN: `${BASE_URL}/api/identity/auth/refresh-token`,
    USER_BY_ID: (id: string) => `${BASE_URL}/api/identity/users/${id}`,
    CHANGE_MY_PASSWORD: `${BASE_URL}/api/identity/users/me/change-password`,
    CHANGE_USER_PASSWORD: (id: string) => `${BASE_URL}/api/identity/users/${id}/change-password`,
  },

  // Shopping Service
  SHOPPING: {
    DASHBOARD: `${BASE_URL}/api/sale-dashboard`,
    MOST_SOLD_PRODUCTS: `${BASE_URL}/api/shopping/most-sold-products`,
    SALES_BY_CATEGORY: `${BASE_URL}/api/shopping/sales-by-category`,
    PRODUCTS: `${BASE_URL}/api/shopping/products`,
    PRODUCT_BY_ID: (id: string) => `${BASE_URL}/api/shopping/products/${id}`,
    STATISTICS: `${BASE_URL}/api/orders/total-count-statistics`,
    USER_LOCATIONS: `${BASE_URL}/api/orders/user-locations`,
  },

  // Inventory Service
  INVENTORY: {
    CATEGORIES: `${BASE_URL}/api/inventory/categories`,
    PRODUCTS: `${BASE_URL}/api/inventory/products`,
    PRODUCT_BY_ID: (id: string) => `${BASE_URL}/api/inventory/products/${id}`,
  },

  // Shared Services
  SHARED: {
    UPLOAD_IMAGES: `${BASE_URL}/api/shared/uploads/images`,
  },
} as const

export const DEFAULT_ADMIN_CREDENTIALS = {
  email: "admin@123",
  password: "Admin@123",
}
