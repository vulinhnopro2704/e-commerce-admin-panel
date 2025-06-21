"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import CategoryTable from "@/components/ui/category-table"
import ConfirmationDialog from "@/components/ui/confirmation-dialog"
import Header from "@/components/layout/header"
import type { Category } from "@/types"
import { apiClient } from "@/lib/api"

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    parentId: "",
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setIsLoading(true)
      const categoryData = await apiClient.getCategories()
      
      // Process the categories into a hierarchical structure
      const rootCategories: Category[] = []
      const categoryMap = new Map<string, Category>()
      
      // First pass: create a map of categories by ID
      categoryData.forEach((category: Category) => {
        categoryMap.set(category.id, { ...category, subCategories: [] })
      })
      
      // Second pass: build the hierarchy
      categoryData.forEach((category: Category) => {
        const categoryWithSubcategories = categoryMap.get(category.id)!
        
        if (category.parentId && categoryMap.has(category.parentId)) {
          // This is a subcategory, add it to its parent
          const parent = categoryMap.get(category.parentId)!
          parent.subCategories = parent.subCategories || []
          parent.subCategories.push(categoryWithSubcategories)
        } else {
          // This is a root category
          rootCategories.push(categoryWithSubcategories)
        }
      })
      
      setCategories(rootCategories)
    } catch (error) {
      console.error("Error fetching categories:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setSelectedCategory(category)
      setFormData({
        name: category.name,
        parentId: category.parentId || "none",
      })
    } else {
      setSelectedCategory(null)
      setFormData({
        name: "",
        parentId: "none",
      })
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setSelectedCategory(null)
    setFormData({
      name: "",
      parentId: "none",
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    try {
      // Prepare category data
      const categoryData = {
        name: formData.name,
        parentId: formData.parentId === "none" ? null : formData.parentId,
      }

      if (selectedCategory) {
        // Update existing category
        const updatedCategory = {
          ...selectedCategory,
          ...categoryData,
        }
        
        // Update the category in the API
        // await apiClient.updateCategory(updatedCategory)
        
        // Update local state
        // This is a simplified update that doesn't handle the hierarchical structure
        // In a real implementation, you would refetch the categories or update the tree structure
        setCategories(
          categories.map((cat) => (cat.id === selectedCategory.id ? updatedCategory : cat))
        )
      } else {
        // Create new category
        const newCategory: Category = {
          id: Date.now().toString(),
          name: formData.name,
          parentId: formData.parentId === "none" ? undefined : formData.parentId,
        }
        
        // Create the category in the API
        // await apiClient.createCategory(newCategory)
        
        // Update local state
        // This is a simplified update that doesn't handle the hierarchical structure
        // In a real implementation, you would refetch the categories or update the tree structure
        setCategories([...categories, newCategory])
      }
      
      handleCloseDialog()
    } catch (error) {
      console.error("Error saving category:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDeleteConfirmation = async () => {
    if (!selectedCategory) return

    try {
      setIsProcessing(true)
      await apiClient.delete(`/api/inventory/categories/${selectedCategory.id}`)
      setCategories(categories.filter((cat) => cat.id !== selectedCategory.id))
      setIsDeleteDialogOpen(false)
      setSelectedCategory(null)
    } catch (error) {
      console.error("Error deleting category:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleAddCategory = (parentId?: string) => {
    setFormData({
      name: "",
      parentId: parentId || "none",
    })
    setSelectedCategory(null)
    setIsDialogOpen(true)
  }
  
  const handleEditCategory = (category: Category) => {
    handleOpenDialog(category)
  }
  
  const handleDeleteCategory = async (category: Category) => {
    setSelectedCategory(category)
    setIsDeleteDialogOpen(true)
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <Header title="Categories Management" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <CategoryTable
          categories={categories}
          isLoading={isLoading}
          onRefresh={fetchCategories}
          onSearch={(query: string) => {
            // Implement search functionality
            console.log("Search:", query)
          }}
          onAdd={handleAddCategory}
          onEdit={handleEditCategory}
          onDelete={handleDeleteCategory}
          emptyState={
            <div className="text-center py-8">
              <p className="text-gray-500">No categories found</p>
            </div>
          }
        />
      </motion.div>

      {/* Add/Edit Category Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
            <DialogDescription>
              {selectedCategory ? "Update the category information below." : "Create a new product category."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter category name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parentId">Parent Category</Label>
              <Select 
                value={formData.parentId} 
                onValueChange={(value) => setFormData({ ...formData, parentId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a parent category (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Root Category)</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog} disabled={isProcessing}>
                Cancel
              </Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700" disabled={isProcessing}>
                {isProcessing ? "Saving..." : selectedCategory ? "Update" : "Create"}
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
          setSelectedCategory(null)
        }}
        onConfirm={handleDeleteConfirmation}
        title="Delete Category"
        message={`Are you sure you want to delete "${selectedCategory?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
        isLoading={isProcessing}
      />
    </div>
  )
}
