"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import CategoryListView from "@/components/ui/category-list-view"
import ConfirmationDialog from "@/components/ui/confirmation-dialog"
import Header from "@/components/layout/header"
import type { Category } from "@/types"
import { useCategoriesStore } from "@/lib/categories-store"
import { apiClient } from "@/lib/api"
import { API_ENDPOINTS } from "@/constants/endpoints"

export default function CategoriesPage() {
  const { categories, isLoading, error, fetchCategories } = useCategoriesStore()
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
  })

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setSelectedCategory(category)
      setFormData({
        name: category.name,
      })
    } else {
      setSelectedCategory(null)
      setFormData({
        name: "",
      })
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setSelectedCategory(null)
    setFormData({
      name: "",
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    try {
      // Prepare category data
      const categoryData = {
        name: formData.name,
      }

      if (selectedCategory) {
        // Update existing category
        await apiClient.updateCategory(selectedCategory.id, categoryData)
      } else {
        // Create new category
        await apiClient.createCategory(categoryData)
      }
      
      // Refresh categories after update
      await fetchCategories()
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
      await apiClient.deleteCategory(selectedCategory.id)
      await fetchCategories()
      setIsDeleteDialogOpen(false)
      setSelectedCategory(null)
    } catch (error) {
      console.error("Error deleting category:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleAddCategory = () => {
    setFormData({
      name: "",
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

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4">
          <p>Error loading categories: {error}</p>
          <Button 
            onClick={() => fetchCategories()} 
            variant="outline" 
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <CategoryListView
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
              <Button 
                onClick={() => handleAddCategory()} 
                className="mt-4 bg-purple-600 hover:bg-purple-700"
              >
                Add First Category
              </Button>
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