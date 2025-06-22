export interface User {
  id: string
  email: string
  name: string
  role: "admin" | "user"
  status: "active" | "disabled"
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  subCategories?: Category[]
  parentId?: string | null
}

export interface Order {
  id: string
  userId: string
  user?: User
  items: OrderItem[]
  total: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: string
  productId: string
  product?: Product
  quantity: number
  price: number
}

export interface DashboardStats {
  totalUsers: number
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  salesByCategory: Array<{
    category: string
    sales: number
  }>
  mostSoldProducts: Array<{
    product: string
    quantity: number
  }>
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

// Generic Pagination Types
export interface PaginationMeta {
  pageIndex: number
  totalPages: number
  totalCount: number
  pageSize: number
}

export interface PaginatedResponse<T> {
  meta: PaginationMeta
  data: T[]
}

// Product Query Parameters
export interface ProductQueryParams {
  Category?: string
  Condition?: string
  Keyword?: string
  PageIndex?: number
  PageSize?: number
  IsDescending?: boolean
  SortBy?: string
}

export interface ProductType {
  name: string
  quantity: number
  price: number
  imageUrl: string
}

export interface ProductImage {
  url: string
}

export interface Product {
  id: string
  name: string
  minPrice: number
  maxPrice: number
  sold: number
  rating: number
  imageUrl: string
  description?: string
  categoryId?: string
  category?: Category
  stock?: number
  status?: "active" | "inactive"
  createdAt?: string
  updatedAt?: string
  // New fields for API
  types?: ProductType[]
  images?: ProductImage[]
  condition?: "New" | "Used" | "Refurbished"
}

export interface CreateUpdateProductRequest {
  id?: string
  name: string
  description: string
  categoryId: string
  types: ProductType[]
  images: ProductImage[]
  condition: "New" | "Used" | "Refurbished"
}


// Auth API Types
export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: {
    accessToken: string
    refreshToken: string
  }
  emailConfirmed: boolean
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface RefreshTokenResponse {
  accessToken: string
  refreshToken: string
}

export interface BaseResponse<T> {
  code: number
  msgNo: string
  listError: Record<string, string>
  data: T
}