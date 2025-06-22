"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Plus, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Header from "@/components/layout/header"
import type { CreateUpdateProductRequest, ProductType, Product } from "@/types"
import { apiClient } from "@/lib/api"
import { useCategoriesStore } from "@/lib/categories-store"
import { toast } from "@/components/ui/use-toast"

export default function CreateProductPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const productId = searchParams.get("id")
  const isEditing = !!productId

  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [product, setProduct] = useState<Product | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Categories store
  const { categories, fetchCategories, getAllCategories } = useCategoriesStore()

  // Form data
  const [formData, setFormData] = useState<CreateUpdateProductRequest>({
    name: "",
    description: "",
    categoryId: "",
    types: [{ name: "", quantity: 0, price: 0, imageUrl: "" }],
    images: [{ url: "" }],
    condition: "New",
  })

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    if (isEditing && productId) {
      fetchProduct(productId)
    }
  }, [isEditing, productId])

  const fetchProduct = async (id: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const product = await apiClient.getProductById(id)

      setProduct(product)
      setFormData({
        id: product.id,
        name: product.name,
        description: product.description || "",
        categoryId: product.categoryId || "",
        types: product.types || [{ name: "", quantity: 0, price: 0, imageUrl: "" }],
        images: product.images || [{ url: "" }],
        condition: product.condition || "New",
      })
    } catch (error) {
      console.error("Error fetching product:", error)
      setError("Failed to load product data. Please try again.")
      toast({
        title: "Error",
        description: "Failed to load product data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)

    try {
      // Filter out empty types and images
      const cleanedData = {
        ...formData,
        types: formData.types.filter((type) => type.name.trim() !== ""),
        images: formData.images.filter((img) => img.url.trim() !== ""),
      }

      if (isEditing && productId) {
        await apiClient.updateProduct(productId, cleanedData)
        toast({
          title: "Success",
          description: "Product updated successfully",
        })
      } else {
        await apiClient.createProduct(cleanedData)
        toast({
          title: "Success",
          description: "Product created successfully",
        })
      }

      router.push("/products")
    } catch (error) {
      console.error("Error saving product:", error)
      setError("Failed to save product. Please try again.")
      toast({
        title: "Error",
        description: "Failed to save product. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const addProductType = () => {
    setFormData({
      ...formData,
      types: [...formData.types, { name: "", quantity: 0, price: 0, imageUrl: "" }],
    })
  }

  const removeProductType = (index: number) => {
    setFormData({
      ...formData,
      types: formData.types.filter((_, i) => i !== index),
    })
  }

  const updateProductType = (index: number, field: keyof ProductType, value: string | number) => {
    const updatedTypes = [...formData.types]
    updatedTypes[index] = { ...updatedTypes[index], [field]: value }
    setFormData({ ...formData, types: updatedTypes })
  }

  const addImage = () => {
    setFormData({
      ...formData,
      images: [...formData.images, { url: "" }],
    })
  }

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    })
  }

  const updateImage = (index: number, url: string) => {
    const updatedImages = [...formData.images]
    updatedImages[index] = { url }
    setFormData({ ...formData, images: updatedImages })
  }

  const allCategories = getAllCategories()

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <Header title={isEditing ? "Edit Product" : "Create Product"} />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <Header title={isEditing ? "Edit Product" : "Create Product"} />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* Back button */}
        <Button variant="outline" onClick={() => router.back()} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Button>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Enter the basic details of your product</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter product name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                    required
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter product description"
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition">Condition *</Label>
                <Select
                  value={formData.condition}
                  onValueChange={(value: "New" | "Used" | "Refurbished") =>
                    setFormData({ ...formData, condition: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Used">Used</SelectItem>
                    <SelectItem value="Refurbished">Refurbished</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Product Types */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Product Types</CardTitle>
                  <CardDescription>Define different variants of your product (size, color, etc.)</CardDescription>
                </div>
                <Button type="button" onClick={addProductType} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Type
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.types.map((type, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">Type {index + 1}</Badge>
                    {formData.types.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeProductType(index)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Type Name *</Label>
                      <Input
                        value={type.name}
                        onChange={(e) => updateProductType(index, "name", e.target.value)}
                        placeholder="e.g., Small, Red, Standard"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Quantity *</Label>
                      <Input
                        type="number"
                        value={type.quantity}
                        onChange={(e) => updateProductType(index, "quantity", Number.parseInt(e.target.value) || 0)}
                        placeholder="0"
                        min="0"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Price ($) *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={type.price}
                        onChange={(e) => updateProductType(index, "price", Number.parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        min="0"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Image URL</Label>
                    <Input
                      value={type.imageUrl}
                      onChange={(e) => updateProductType(index, "imageUrl", e.target.value)}
                      placeholder="https://example.com/image.jpg"
                    />
                    {type.imageUrl && (
                      <div className="mt-2 w-24 h-24 rounded-md overflow-hidden border">
                        <img
                          src={type.imageUrl}
                          alt={`Type ${type.name} preview`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = "/placeholder.svg"
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Product Images */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Product Images</CardTitle>
                  <CardDescription>Add multiple images for your product gallery</CardDescription>
                </div>
                <Button type="button" onClick={addImage} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Image
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex-1">
                      <Label>Image URL {index + 1}</Label>
                      <Input
                        value={image.url}
                        onChange={(e) => updateImage(index, e.target.value)}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    {image.url && (
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={image.url || "/placeholder.svg"}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = "/placeholder.svg"
                          }}
                        />
                      </div>
                    )}
                    {formData.images.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeImage(index)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-4 pt-6">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" className="bg-purple-600 hover:bg-purple-700" disabled={isSaving}>
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  {isEditing ? "Updating..." : "Creating..."}
                </span>
              ) : (
                <span>{isEditing ? "Update Product" : "Create Product"}</span>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
