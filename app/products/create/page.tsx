"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Plus, Trash2, X, Upload, Link, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Header from "@/components/layout/header"
import type { CreateUpdateProductRequest, ProductType, Product } from "@/types"
import { apiClient } from "@/lib/api"
import { useCategoriesStore } from "@/lib/categories-store"
import { toast } from "@/components/ui/use-toast"
import { API_ENDPOINTS } from "@/constants/endpoints"

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

  const [uploadingImages, setUploadingImages] = useState<{ [key: string]: boolean }>({})
  const fileInputRef = useRef<HTMLInputElement>(null)
  const typeFileInputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Add state for locally stored files
  const [productImages, setProductImages] = useState<File[]>([])
  const [typeImages, setTypeImages] = useState<(File | null)[]>([])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    if (isEditing && productId) {
      fetchProduct(productId)
    }

    // Initialize typeImages array when types change
    setTypeImages(Array(formData.types.length).fill(null))
  }, [isEditing, productId, formData.types.length])

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

  const uploadImages = async (files: File[]): Promise<string[]> => {
    if (!files.length) return []

    try {
      // Use apiClient.uploadImages which already handles authentication and proper formatting
      const uploadedUrls = await apiClient.uploadImages(files)

      if (uploadedUrls.length === 0) {
        toast({
          title: "Upload Failed",
          description: "No images were uploaded. Please try again.",
          variant: "destructive",
        })
      }

      return uploadedUrls
    } catch (error) {
      console.error('Image upload error:', error)
      toast({
        title: "Upload Failed",
        description: "Failed to upload images. Please try again.",
        variant: "destructive",
      })
      return []
    }
  }

  const uploadAllImages = async (): Promise<{mainImageUrls: string[], typeImageUrls: string[]}> => {
    const filesToUpload: File[] = []

    // Add all product images to upload queue
    productImages.forEach(file => {
      if (file) filesToUpload.push(file)
    })

    // Add all type images to upload queue
    const typeFilesToUpload = typeImages.filter(file => file !== null) as File[]
    filesToUpload.push(...typeFilesToUpload)

    if (filesToUpload.length === 0) {
      // If no new files to upload, return existing URLs
      return {
        mainImageUrls: formData.images.map(img => img.url).filter(url => url.startsWith('http')),
        typeImageUrls: formData.types.map(type => type.imageUrl).filter(url => url.startsWith('http'))
      }
    }

    try {
      setUploadingImages({ main: true })
      const uploadedUrls = await apiClient.uploadImages(filesToUpload)

      // Divide the returned URLs between product images and type images
      const mainImageCount = productImages.filter(f => f !== null).length
      const mainImageUrls = uploadedUrls.slice(0, mainImageCount)
      const typeImageUrls = uploadedUrls.slice(mainImageCount)

      return { mainImageUrls, typeImageUrls }
    } catch (error) {
      console.error('Failed to upload images:', error)
      toast({
        title: "Upload Failed",
        description: "Failed to upload images. Please try again.",
        variant: "destructive",
      })
      return { mainImageUrls: [], typeImageUrls: [] }
    } finally {
      setUploadingImages({ main: false })
    }
  }

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    isForProductType: boolean = false,
    typeIndex: number = -1
  ) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    if (isForProductType) {
      // Store type image file
      const file = files[0]
      const newTypeImages = [...typeImages]
      newTypeImages[typeIndex] = file
      setTypeImages(newTypeImages)

      // Create temporary local URL for preview
      const localUrl = URL.createObjectURL(file)
      const updatedTypes = [...formData.types]
      updatedTypes[typeIndex] = { ...updatedTypes[typeIndex], imageUrl: localUrl }
      setFormData({ ...formData, types: updatedTypes })
    } else {
      // Store product image files
      const fileArray = Array.from(files)
      setProductImages([...productImages, ...fileArray])

      // Create temporary local URLs for preview
      const localUrls = fileArray.map(file => URL.createObjectURL(file))
      const newImages = localUrls.map(url => ({ url }))
      setFormData({
        ...formData,
        images: [...formData.images, ...newImages].filter(img => img.url !== ""),
      })
    }

    // Reset file input
    if (isForProductType && typeFileInputRefs.current[typeIndex]) {
      typeFileInputRefs.current[typeIndex]!.value = ""
    } else if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (
    e: React.DragEvent,
    isForProductType: boolean = false,
    typeIndex: number = -1
  ) => {
    e.preventDefault()
    e.stopPropagation()

    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return

    if (isForProductType) {
      // Store type image file
      const file = e.dataTransfer.files[0]
      const newTypeImages = [...typeImages]
      newTypeImages[typeIndex] = file
      setTypeImages(newTypeImages)

      // Create temporary local URL for preview
      const localUrl = URL.createObjectURL(file)
      const updatedTypes = [...formData.types]
      updatedTypes[typeIndex] = { ...updatedTypes[typeIndex], imageUrl: localUrl }
      setFormData({ ...formData, types: updatedTypes })
    } else {
      // Store product image files
      const fileArray = Array.from(e.dataTransfer.files)
      setProductImages([...productImages, ...fileArray])

      // Create temporary local URLs for preview
      const localUrls = fileArray.map(file => URL.createObjectURL(file))
      const newImages = localUrls.map(url => ({ url }))
      setFormData({
        ...formData,
        images: [...formData.images, ...newImages].filter(img => img.url !== ""),
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)

    try {
      // 1. First upload all images
      const { mainImageUrls, typeImageUrls } = await uploadAllImages()

      // 2. Update form data with real image URLs
      let updatedFormData = { ...formData }

      // Replace local image URLs with server URLs for product images
      if (mainImageUrls.length > 0) {
        let existingServerImages = formData.images
          .filter(img => img.url.startsWith('http') && !img.url.startsWith('blob:'))
          .map(img => ({ url: img.url }))

        updatedFormData = {
          ...updatedFormData,
          images: [
            ...existingServerImages,
            ...mainImageUrls.map(url => ({ url }))
          ]
        }
      }

      // Replace local image URLs with server URLs for type images
      if (typeImageUrls.length > 0) {
        const updatedTypes = [...formData.types]
        let typeImageIndex = 0

        for (let i = 0; i < updatedTypes.length; i++) {
          // If this type has a local image (blob URL), replace it with a server URL
          if (typeImages[i] && typeImageUrls[typeImageIndex]) {
            updatedTypes[i] = {
              ...updatedTypes[i],
              imageUrl: typeImageUrls[typeImageIndex]
            }
            typeImageIndex++
          }
        }

        updatedFormData = {
          ...updatedFormData,
          types: updatedTypes
        }
      }

      // 3. Filter out empty types and images
      const cleanedData = {
        ...updatedFormData,
        types: updatedFormData.types.filter((type) => type.name.trim() !== ""),
        images: updatedFormData.images.filter((img) => img.url.trim() !== "" && !img.url.startsWith('blob:')),
      }

      // 4. Create or update the product with the new data
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
    // Remove the file from productImages if it exists
    if (index < productImages.length) {
      const newProductImages = [...productImages]
      newProductImages.splice(index, 1)
      setProductImages(newProductImages)
    }

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
                  onValueChange={(value: "New" | "Used" | "LikeNew") =>
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
                    <SelectItem value="LikeNew">LikeNew</SelectItem>
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
                    <Label>Type Image</Label>
                    <Tabs defaultValue="url" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="url" className="flex items-center gap-1">
                          <Link className="w-4 h-4" />
                          URL
                        </TabsTrigger>
                        <TabsTrigger value="upload" className="flex items-center gap-1">
                          <Upload className="w-4 h-4" />
                          Upload
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="url" className="mt-2">
                        <Input
                          value={type.imageUrl}
                          onChange={(e) => updateProductType(index, "imageUrl", e.target.value)}
                          placeholder="https://example.com/image.jpg"
                        />
                      </TabsContent>
                      <TabsContent value="upload" className="mt-2">
                        <div
                          className={`border-2 border-dashed rounded-md p-4 text-center ${
                            uploadingImages[`type-${index}`] ? "bg-gray-50 border-gray-300" : "hover:bg-gray-50 border-gray-300 hover:border-purple-500"
                          }`}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, true, index)}
                        >
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={(el) => {
                              typeFileInputRefs.current[index] = el
                            }}
                            onChange={(e) => handleFileUpload(e, true, index)}
                          />
                          {uploadingImages[`type-${index}`] ? (
                            <div className="py-2">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-700 mx-auto"></div>
                              <p className="text-sm text-gray-500 mt-2">Uploading...</p>
                            </div>
                          ) : (
                            <div
                              className="py-2 cursor-pointer"
                              onClick={() => typeFileInputRefs.current[index]?.click()}
                            >
                              <ImageIcon className="mx-auto h-8 w-8 text-gray-400" />
                              <p className="text-sm text-gray-500 mt-2">
                                Drag & drop an image or click to browse
                              </p>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
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
              <Tabs defaultValue="url" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="url" className="flex items-center gap-1">
                    <Link className="w-4 h-4" />
                    URL
                  </TabsTrigger>
                  <TabsTrigger value="upload" className="flex items-center gap-1">
                    <Upload className="w-4 h-4" />
                    Upload
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="url">
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
                </TabsContent>

                <TabsContent value="upload">
                  <div
                    className={`border-2 border-dashed rounded-md p-8 text-center ${
                      uploadingImages["main"] ? "bg-gray-50 border-gray-300" : "hover:bg-gray-50 border-gray-300 hover:border-purple-500"
                    }`}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e)}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                    />

                    {uploadingImages["main"] ? (
                      <div className="py-6">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-700 mx-auto"></div>
                        <p className="text-gray-500 mt-4">Uploading images...</p>
                      </div>
                    ) : (
                      <div
                        className="py-6 cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="text-gray-500 mt-4">
                          Drag & drop images here or click to browse
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          You can upload multiple images at once
                        </p>
                      </div>
                    )}
                  </div>

                  {formData.images.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-sm font-medium mb-3">Uploaded Images</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {formData.images
                          .filter((img) => img.url)
                          .map((image, index) => (
                            <div key={index} className="relative group">
                              <div className="w-full aspect-square rounded-lg overflow-hidden border bg-gray-50">
                                <img
                                  src={image.url}
                                  alt={`Image ${index + 1}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement
                                    target.src = "/placeholder.svg"
                                  }}
                                />
                              </div>
                              <Button
                                type="button"
                                onClick={() => removeImage(index)}
                                variant="destructive"
                                size="icon"
                                className="absolute -top-2 -right-2 w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
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