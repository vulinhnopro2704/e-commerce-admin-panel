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
