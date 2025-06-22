"use client"
import { cn } from "@/lib/utils"
import type React from "react"

import { motion } from "framer-motion"
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Filter, RefreshCw, Search } from "lucide-react"
import { useMemo, useState, useEffect } from "react"

export interface Column<T> {
  key: string
  header: string
  render?: (item: T) => React.ReactNode
  sortable?: boolean
  width?: string
  sortKey?: string // Optional API sort key if different from column key
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (item: T) => string
  isLoading?: boolean
  pagination?: {
    currentPage: number
    totalPages: number
    totalItems: number
    onPageChange: (page: number) => void
  }
  actions?: React.ReactNode
  onRefresh?: () => void
  onSearch?: (query: string) => void
  onFilter?: () => void
  onSort?: (sortKey: string, isDescending: boolean) => void // New prop for handling sorting
  sortConfig?: { key: string; direction: "asc" | "desc" } | null // External sort config
  emptyState?: React.ReactNode
}

export default function DataTable<T extends Record<string, any>>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  pagination,
  actions,
  onRefresh,
  onSearch,
  onFilter,
  onSort,
  sortConfig: externalSortConfig,
  emptyState,
}: DataTableProps<T>) {
  const [internalSortConfig, setInternalSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Use external sort config if provided, otherwise use internal
  const sortConfig = externalSortConfig || internalSortConfig

  // Effect to update internal state when external state changes
  useEffect(() => {
    if (externalSortConfig !== undefined) {
      setInternalSortConfig(externalSortConfig);
    }
  }, [externalSortConfig]);

  const sortedData = useMemo(() => {
    if (!sortConfig || onSort) return data // If onSort is provided, assume external sorting

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]

      if (aValue === bValue) return 0

      const compareResult = aValue < bValue ? -1 : 1
      return sortConfig.direction === "asc" ? compareResult : -compareResult
    })
  }, [data, sortConfig, onSort])

  const handleSort = (column: Column<T>) => {
    if (!column.sortable) return

    const key = column.key
    const sortKey = column.sortKey || key

    let direction: "asc" | "desc" = "asc"
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }

    if (onSort) {
      // Call external sort handler with appropriate parameters
      onSort(sortKey, direction === "desc")
    } else {
      // Otherwise use internal sorting
      setInternalSortConfig({ key, direction })
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (onSearch) {
      onSearch(searchQuery)
    }
  }

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
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </form>
          )}
          {onFilter && (
            <button
              type="button"
              onClick={onFilter}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </button>
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
          {actions}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-purple-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    className={cn(
                      "px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-purple-700",
                      column.sortable && "cursor-pointer hover:bg-purple-100",
                      column.width,
                    )}
                    onClick={() => column.sortable && handleSort(column)}
                    onKeyDown={(e) => {
                      if (column.sortable && (e.key === "Enter" || e.key === " ")) {
                        e.preventDefault()
                        handleSort(column)
                      }
                    }}
                    tabIndex={column.sortable ? 0 : -1}
                    role={column.sortable ? "button" : undefined}
                    style={column.width ? { width: column.width } : undefined}
                  >
                    <div className="flex items-center">
                      <span>{column.header}</span>
                      {column.sortable && sortConfig && sortConfig.key === column.key && (
                        <span className="ml-1">
                          {sortConfig.direction === "asc" ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={`loading-${index}`}>
                    {columns.map((column) => (
                      <td key={`loading-${index}-${column.key}`} className="whitespace-nowrap px-6 py-4">
                        <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : sortedData.length > 0 ? (
                sortedData.map((item, index) => (
                  <motion.tr
                    key={keyExtractor(item)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-purple-50"
                  >
                    {columns.map((column) => (
                      <td key={`${keyExtractor(item)}-${column.key}`} className="whitespace-nowrap px-6 py-4">
                        {column.render
                          ? column.render(item)
                          : item[column.key] !== undefined
                            ? String(item[column.key])
                            : ""}
                      </td>
                    ))}
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-8 text-center">
                    {emptyState || (
                      <div className="flex flex-col items-center justify-center">
                        <p className="text-gray-500">No data available</p>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 0 && (
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(pagination.currentPage - 1) * 10 + 1}</span> to{" "}
                  <span className="font-medium">{Math.min(pagination.currentPage * 10, pagination.totalItems)}</span> of{" "}
                  <span className="font-medium">{pagination.totalItems}</span> results
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <button
                    type="button"
                    onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </button>
                  {Array.from({ length: pagination.totalPages }).map((_, index) => {
                    const page = index + 1
                    const isCurrentPage = page === pagination.currentPage

                    if (
                      page === 1 ||
                      page === pagination.totalPages ||
                      (page >= pagination.currentPage - 1 && page <= pagination.currentPage + 1)
                    ) {
                      return (
                        <button
                          type="button"
                          key={page}
                          onClick={() => pagination.onPageChange(page)}
                          className={cn(
                            "relative inline-flex items-center border px-4 py-2 text-sm font-medium",
                            isCurrentPage
                              ? "z-10 border-purple-500 bg-purple-100 text-purple-700"
                              : "border-gray-300 bg-white text-gray-500 hover:bg-gray-50",
                          )}
                        >
                          {page}
                        </button>
                      )
                    }

                    if (
                      (page === 2 && pagination.currentPage > 3) ||
                      (page === pagination.totalPages - 1 && pagination.currentPage < pagination.totalPages - 2)
                    ) {
                      return (
                        <span
                          key={page}
                          className="relative inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700"
                        >
                          ...
                        </span>
                      )
                    }

                    return null
                  })}
                  <button
                    type="button"
                    onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
