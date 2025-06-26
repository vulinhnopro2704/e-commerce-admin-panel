"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Plus, Trash2, RefreshCw, Eye, UserCheck, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import DataTable, { type Column } from "@/components/ui/data-table"
import ConfirmationDialog from "@/components/ui/confirmation-dialog"
import AddUserDialog from "@/components/customers/add-user-dialog"
import Header from "@/components/layout/header"
import type { PaginationMeta, User, UserQueryParams } from "@/types"
import { apiClient } from "@/lib/api"
import UserDetailsDialog from "@/components/customers/user-details-dialog"

export default function CustomersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [dialogType, setDialogType] = useState<"delete" | "restore" | "details" | null>(null)
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null)
  const [pagination, setPagination] = useState<PaginationMeta>({
    pageIndex: 1,
    totalPages: 0,
    totalCount: 0,
    pageSize: 10
  })
  const [queryParams, setQueryParams] = useState<UserQueryParams>({
    PageIndex: 1,
    PageSize: 10
  })

  useEffect(() => {
    fetchUsers()
  }, [queryParams])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.getUsers(queryParams)
      setUsers(response.data)
      setPagination(response.meta)
    } catch (error) {
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setQueryParams({
      ...queryParams,
      Keyword: query,
      PageIndex: 1 // Reset to first page on new search
    })
  }

  const handlePageChange = (pageIndex: number) => {
    setQueryParams({
      ...queryParams,
      PageIndex: pageIndex
    })
  }

  const handleSort = (sortKey: string, isDescending: boolean) => {
    // Update the sort configuration for UI
    setSortConfig({
      key: sortKey.toLowerCase(), // Store lowercase for UI matching
      direction: isDescending ? "desc" : "asc"
    })
    
    // Update query params for API
    setQueryParams({
      ...queryParams,
      SortBy: sortKey, // API expects PascalCase
      IsDescending: isDescending,
      PageIndex: 1 // Reset to first page on sort change
    })
  }

  const handleDeleteUser = async () => {
    if (!selectedUser || isProcessing) return // Prevent duplicate calls

    try {
      setIsProcessing(true)
      await apiClient.deleteUser(selectedUser.id)
      
      // Immediately update UI state on success
      setDialogType(null)
      setSelectedUser(null)
      
      // Then fetch updated data
      fetchUsers()
    } catch (error) {
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRestoreUser = async () => {
    if (!selectedUser || isProcessing) return // Prevent duplicate calls

    try {
      setIsProcessing(true)
      await apiClient.restoreUser(selectedUser.id)
      
      // Immediately update UI state on success
      setDialogType(null)
      setSelectedUser(null)
      
      // Then fetch updated data
      fetchUsers()
    } catch (error) {
    } finally {
      setIsProcessing(false)
    }
  }

  const columns: Column<User>[] = [
    {
      key: "name",
      header: "Name",
      sortable: true,
      sortKey: "Name", // API field name
      render: (user) => (
        <div className="cursor-pointer" onClick={() => {
          setSelectedUser(user)
          setDialogType("details")
        }}>
          <div className="font-medium text-gray-900">{user.name}</div>
          <div className="text-sm text-gray-500">{user.email}</div>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      sortable: true,
      sortKey: "Email", // API field name
      render: (user) => <div className="text-sm text-gray-500">{user.email}</div>,
    },
    {
      key: "emailConfirmed",
      header: "Email Status",
      render: (user) => (
        <Badge variant={user.emailConfirmed ? "default" : "secondary"}>
          {user.emailConfirmed ? "Verified" : "Unverified"}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (user) => (
        <Badge variant={!user.deletedAt ? "default" : "destructive"} className={user.deletedAt ? "bg-red-100 text-red-800" : ""}>
          {!user.deletedAt ? "Active" : "Deleted"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      sortable: true,
      sortKey: "CreatedAt", // API field name
      render: (user) => new Date(user.createdAt).toLocaleDateString(),
    },
    {
      key: "actions",
      header: "Actions",
      render: (user) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedUser(user)
              setDialogType("details")
            }}
            className="text-blue-600 hover:text-blue-700"
          >
            <Eye className="w-4 h-4" />
          </Button>
          
          {user.deletedAt ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedUser(user)
                setDialogType("restore")
              }}
              className="text-green-600 hover:text-green-700"
            >
              <UserCheck className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedUser(user)
                setDialogType("delete")
              }}
              className="text-red-600 hover:text-red-700"
              disabled={user.role === "admin"}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="flex-1 space-y-6 p-6">
      <Header title="Customer Management" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <DataTable
          columns={columns}
          data={users}
          keyExtractor={(user) => user.id}
          isLoading={isLoading}
          onRefresh={fetchUsers}
          onSearch={handleSearch}
          onSort={handleSort}
          sortConfig={sortConfig}
          pagination={{
            currentPage: pagination.pageIndex,
            totalPages: pagination.totalPages,
            totalItems: pagination.totalCount,
            onPageChange: handlePageChange
          }}
          actions={
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={fetchUsers} 
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button 
                className="bg-purple-600 hover:bg-purple-700"
                onClick={() => setIsAddUserDialogOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Customer
              </Button>
            </div>
          }
          emptyState={
            <div className="text-center py-8">
              <p className="text-gray-500">No customers found</p>
            </div>
          }
        />
      </motion.div>

      {/* Add User Dialog */}
      <AddUserDialog 
        isOpen={isAddUserDialogOpen}
        onClose={() => setIsAddUserDialogOpen(false)}
        onSuccess={fetchUsers}
      />

      {/* User Details Dialog */}
      <UserDetailsDialog
        isOpen={dialogType === "details"}
        onClose={() => {
          setDialogType(null)
          setSelectedUser(null)
        }}
        user={selectedUser}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={dialogType === "delete"}
        onClose={() => {
          setDialogType(null)
          setSelectedUser(null)
        }}
        onConfirm={handleDeleteUser}
        title="Delete Customer"
        message={`Are you sure you want to delete ${selectedUser?.name}? This user will be soft-deleted and can be restored later.`}
        confirmText="Delete"
        type="danger"
        isLoading={isProcessing}
      />

      {/* Restore Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={dialogType === "restore"}
        onClose={() => {
          setDialogType(null)
          setSelectedUser(null)
        }}
        onConfirm={handleRestoreUser}
        title="Restore Customer"
        message={`Are you sure you want to restore ${selectedUser?.name}?`}
        confirmText="Restore"
        type="success"
        isLoading={isProcessing}
      />
    </div>
  )
}
