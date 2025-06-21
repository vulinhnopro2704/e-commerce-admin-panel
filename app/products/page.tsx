"use client"

import type React from "react"
import { Package } from "lucide-react" // Import Package here

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Plus, Edit, Trash2, Search, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import DataTable, { type Column } from "@/components/ui/data-table"
import ConfirmationDialog from "@/components/ui/confirmation-dialog"
import Header from "@/components/layout/header"
import type { Product, ProductQueryParams, PaginatedResponse } from "@/types"
import { apiClient } from "@/lib/api"
import { useCategoriesStore } from "@/lib/categories-store"
import ApiStatus from "@/components/ui/api-status"
import ApiDebug from "@/components/ui/api-debug"

export default function ProductsPage() {
  const [productsResponse, setProductsResponse] = useState<PaginatedResponse<Product> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showDebug, setShowDebug] = useState(false)

  // Query parameters
  const [queryParams, setQueryParams] = useState<ProductQueryParams>({
    PageIndex: 1,
    PageSize: 10,
    IsDescending: false,
    SortBy: "name",
  })

  // Categories store
  const {
    categories,
    fetchCategories,
    getCategoryById,
    getAllCategories,
    error: categoriesError,
  } = useCategoriesStore()

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    minPrice: "",
    maxPrice: "",
    categoryId: "",
    stock: "",
    status: "active" as "active" | "inactive",
  })

  useEffect(() => {
    // Fetch categories first
    fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    fetchProducts()
  }, [queryParams])

  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.getProducts(queryParams)
      setProductsResponse(response)
    } catch (error) {
      console.error("Error fetching products:", error)

      // Show user-friendly error message
      if (error instanceof Error) {
        if (error.message.includes("HTML response")) {
          alert(
            "API Error: Please visit the API URL in your browser first to bypass ngrok verification, then try again.",
          )
        } else if (error.message.includes("Failed to fetch")) {
          alert("Network Error: Unable to connect to API. Please check your connection and try again.")
        } else {
          alert(`Failed to fetch products: ${error.message}`)
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (keyword: string) => {
    setQueryParams((prev) => ({
      ...prev,
      Keyword: keyword || undefined,
      PageIndex: 1, // Reset to first page
    }))
  }

  const handleCategoryFilter = (categoryId: string) => {
    setQueryParams((prev) => ({
      ...prev,
      Category: categoryId === "all" ? undefined : categoryId,
      PageIndex: 1, // Reset to first page
    }))
  }

  const handleSort = (sortBy: string, isDescending: boolean) => {
    setQueryParams((prev) => ({
      ...prev,
      SortBy: sortBy,
      IsDescending: isDescending,
      PageIndex: 1, // Reset to first page
    }))
  }

  const handlePageChange = (page: number) => {
    setQueryParams((prev) => ({
      ...prev,
      PageIndex: page,
    }))
  }

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setSelectedProduct(product)
      setFormData({
        name: product.name,
        description: product.description || "",
        minPrice: product.minPrice.toString(),
        maxPrice: product.maxPrice.toString(),
        categoryId: product.categoryId || "",
        stock: product.stock?.toString() || "0",
        status: product.status || "active",
      })
    } else {
      setSelectedProduct(null)
      setFormData({
        name: "",
        description: "",
        minPrice: "",
        maxPrice: "",
        categoryId: "",
        stock: "",
        status: "active",
      })
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setSelectedProduct(null)
    setFormData({
      name: "",
      description: "",
      minPrice: "",
      maxPrice: "",
      categoryId: "",
      stock: "",
      status: "active",
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    try {
      const productData = {
        ...formData,
        minPrice: Number.parseFloat(formData.minPrice),
        maxPrice: Number.parseFloat(formData.maxPrice),
        stock: Number.parseInt(formData.stock),
      }

      if (selectedProduct) {
        await apiClient.updateProduct(selectedProduct.id, productData)
      } else {
        await apiClient.createProduct(productData)
      }

      handleCloseDialog()
      fetchProducts() // Refresh the list
    } catch (error) {
      console.error("Error saving product:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return

    try {
      setIsProcessing(true)
      await apiClient.deleteProduct(selectedProduct.id)
      setIsDeleteDialogOpen(false)
      setSelectedProduct(null)
      fetchProducts() // Refresh the list
    } catch (error) {
      console.error("Error deleting product:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return "No Category"
    const category = getCategoryById(categoryId)
    return category?.name || "Unknown"
  }

  const columns: Column<Product>[] = [
    {
      key: "imageUrl",
      header: "Image",
      width: "80px",
      render: (product) => (
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
          {product.imageUrl ? (
            <img
              src={product.imageUrl || "/placeholder.svg"}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = "none"
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Package className="w-6 h-6" />
            </div>
          )}
        </div>
      ),
    },
    {
      key: "name",
      header: "Product",
      sortable: true,
      render: (product) => (
        <div className="max-w-xs">
          <div className="font-medium text-gray-900 truncate">{product.name}</div>
          <div className="text-sm text-gray-500">ID: {product.id.slice(0, 8)}...</div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (product) => <Badge variant="outline">{getCategoryName(product.categoryId)}</Badge>,
    },
    {
      key: "price",
      header: "Price Range",
      sortable: true,
      render: (product) => (
        <div className="text-sm">
          <div className="font-medium">${product.minPrice.toFixed(2)}</div>
          {product.maxPrice !== product.minPrice && (
            <div className="text-gray-500">- ${product.maxPrice.toFixed(2)}</div>
          )}
        </div>
      ),
    },
    {
      key: "sold",
      header: "Sold",
      sortable: true,
      render: (product) => <span className="font-medium">{product.sold}</span>,
    },
    {
      key: "rating",
      header: "Rating",
      sortable: true,
      render: (product) => (
        <div className="flex items-center">
          <span className="text-yellow-500">★</span>
          <span className="ml-1 text-sm">{product.rating.toFixed(1)}</span>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (product) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenDialog(product)}
            className="text-purple-600 hover:text-purple-700"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedProduct(product)
              setIsDeleteDialogOpen(true)
            }}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ]

  const allCategories = getAllCategories()

  return (
    <div className="flex-1 space-y-6 p-6">
      <Header title="Product Management" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* Debug Tools */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowDebug(!showDebug)}>
            {showDebug ? "Hide" : "Show"} Debug Tools
          </Button>
          {categoriesError && (
            <Badge variant="destructive" className="text-xs">
              Categories Error: {categoriesError}
            </Badge>
          )}
        </div>

        {showDebug && <ApiDebug />}

        {/* API Status */}
        <ApiStatus onRetry={fetchProducts} />

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search products..."
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={queryParams.Category || "all"} onValueChange={handleCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {allCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={`${queryParams.SortBy}-${queryParams.IsDescending}`}
              onValueChange={(value) => {
                const [sortBy, isDesc] = value.split("-")
                handleSort(sortBy, isDesc === "true")
              }}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-false">Name (A-Z)</SelectItem>
                <SelectItem value="name-true">Name (Z-A)</SelectItem>
                <SelectItem value="minPrice-false">Price (Low-High)</SelectItem>
                <SelectItem value="minPrice-true">Price (High-Low)</SelectItem>
                <SelectItem value="sold-true">Most Sold</SelectItem>
                <SelectItem value="rating-true">Highest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={fetchProducts} disabled={isLoading} className="flex items-center gap-2">
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button onClick={() => handleOpenDialog()} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={productsResponse?.data || []}
          keyExtractor={(product) => product.id}
          isLoading={isLoading}
          pagination={
            productsResponse
              ? {
                  currentPage: productsResponse.meta.pageIndex,
                  totalPages: productsResponse.meta.totalPages,
                  totalItems: productsResponse.meta.totalCount,
                  onPageChange: handlePageChange,
                }
              : undefined
          }
          emptyState={
            <div className="text-center py-8">
              <p className="text-gray-500">No products found</p>
            </div>
          }
        />
      </motion.div>

      {/* Add/Edit Product Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
            <DialogDescription>
              {selectedProduct ? "Update the product information below." : "Create a new product for your store."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter product name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter product description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minPrice">Min Price ($)</Label>
                <Input
                  id="minPrice"
                  type="number"
                  step="0.01"
                  value={formData.minPrice}
                  onChange={(e) => setFormData({ ...formData, minPrice: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxPrice">Max Price ($)</Label>
                <Input
                  id="maxPrice"
                  type="number"
                  step="0.01"
                  value={formData.maxPrice}
                  onChange={(e) => setFormData({ ...formData, maxPrice: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {allCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "active" | "inactive") => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog} disabled={isProcessing}>
                Cancel
              </Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700" disabled={isProcessing}>
                {isProcessing ? "Saving..." : selectedProduct ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          setSelectedProduct(null)
        }}
        onConfirm={handleDeleteProduct}
        title="Delete Product"
        message={`Are you sure you want to delete "${selectedProduct?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
        isLoading={isProcessing}
      />
    </div>
  )
}
