"use client"

import { cn } from "@/lib/utils"
import type React from "react"
import { useState } from "react"
import { ChevronDown, ChevronRight, ChevronLeft, ChevronUp, Filter, RefreshCw, Search, Edit, Trash2, Plus } from "lucide-react"
import { Button } from "./button"
import type { Category } from "@/types"

interface CategoryTableProps {
  categories: Category[]
  isLoading?: boolean
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
  onAdd: (parentId?: string) => void
  onRefresh?: () => void
  onSearch?: (query: string) => void
  emptyState?: React.ReactNode
}

export default function CategoryTable({
  categories,
  isLoading = false,
  onEdit,
  onDelete,
  onAdd,
  onRefresh,
  onSearch,
  emptyState,
}: CategoryTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prevExpanded) => {
      const newExpanded = new Set(prevExpanded)
      if (newExpanded.has(categoryId)) {
        newExpanded.delete(categoryId)
      } else {
        newExpanded.add(categoryId)
      }
      return newExpanded
    })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (onSearch) {
      onSearch(searchQuery)
    }
  }
  // Recursive function to render category rows
  const renderCategoryRows = (categories: Category[], level = 0): React.ReactNode[] => {
    return categories.flatMap((category) => {
      const hasSubCategories = category.subCategories && category.subCategories.length > 0
      const isExpanded = expandedCategories.has(category.id)
      
      const rows: React.ReactNode[] = [
        <tr key={category.id} className={cn("hover:bg-purple-50", hasSubCategories && "bg-purple-50/50")}>
          <td className="whitespace-nowrap px-6 py-4">
            <div className="flex items-center">
              <div style={{ width: `${level * 24}px` }} className="flex-shrink-0"></div>
              {hasSubCategories ? (
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="mr-2 flex h-5 w-5 items-center justify-center rounded-full bg-purple-100 hover:bg-purple-200"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-purple-600" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-purple-600" />
                  )}
                </button>
              ) : (
                <div className="mr-2 w-5"></div>
              )}
              <span className={cn(
                "font-medium", 
                hasSubCategories ? "text-purple-700 font-semibold" : "text-gray-900"
              )}>
                {category.name}
              </span>
              {hasSubCategories && (
                <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                  {category.subCategories?.length || 0}
                </span>
              )}
            </div>
          </td>          <td className="whitespace-nowrap px-6 py-4">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(category)}
                className="text-purple-600 hover:text-purple-700"
                title="Edit category"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(category)}
                className="text-red-600 hover:text-red-700"
                title="Delete category"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </td>
        </tr>,
      ]

      if (hasSubCategories && isExpanded) {
        const subRows = renderCategoryRows(category.subCategories!, level + 1)
        rows.push(...subRows)
      }

      return rows
    })
  }

  // Get flat categories for empty state check
  const flattenCategories = (categories: Category[]): Category[] => {
    return categories.flatMap((category) => {
      if (category.subCategories && category.subCategories.length > 0) {
        return [category, ...flattenCategories(category.subCategories)]
      }
      return [category]
    })
  }

  const allCategories = flattenCategories(categories)

  return (
    <div className="space-y-4">
      {/* Table actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          {onSearch && (
            <form onSubmit={handleSearch} className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </form>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              disabled={isLoading}
            >
              <RefreshCw className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")} />
              Refresh
            </button>
          )}
          <Button onClick={() => onAdd()} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">            <thead className="bg-purple-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-purple-700"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-purple-700"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={`loading-${index}`}>
                    {Array.from({ length: 2 }).map((_, colIndex) => (
                      <td key={`loading-${index}-${colIndex}`} className="whitespace-nowrap px-6 py-4">
                        <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : allCategories.length > 0 ? (
                renderCategoryRows(categories)
              ) : (
                <tr>
                  <td colSpan={2} className="px-6 py-8 text-center">
                    {emptyState || (
                      <div className="flex flex-col items-center justify-center">
                        <p className="text-gray-500">No categories found</p>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}