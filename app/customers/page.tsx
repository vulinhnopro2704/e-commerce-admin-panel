"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Plus, Trash2, UserX, UserCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import DataTable, { type Column } from "@/components/ui/data-table"
import ConfirmationDialog from "@/components/ui/confirmation-dialog"
import Header from "@/components/layout/header"
import type { User } from "@/types"
import { apiClient } from "@/lib/api"

export default function CustomersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [dialogType, setDialogType] = useState<"delete" | "disable" | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const userData = await apiClient.getUsers()
      setUsers(userData)
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return

    try {
      setIsProcessing(true)
      await apiClient.deleteUser(selectedUser.id)
      setUsers(users.filter((user) => user.id !== selectedUser.id))
      setDialogType(null)
      setSelectedUser(null)
    } catch (error) {
      console.error("Error deleting user:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleToggleUserStatus = async () => {
    if (!selectedUser) return

    try {
      setIsProcessing(true)
      const newStatus = selectedUser.status === "active" ? "disabled" : "active"
      // In real app, you'd call an API to update user status
      setUsers(users.map((user) => (user.id === selectedUser.id ? { ...user, status: newStatus } : user)))
      setDialogType(null)
      setSelectedUser(null)
    } catch (error) {
      console.error("Error updating user status:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const columns: Column<User>[] = [
    {
      key: "name",
      header: "Name",
      sortable: true,
      render: (user) => (
        <div>
          <div className="font-medium text-gray-900">{user.name}</div>
          <div className="text-sm text-gray-500">{user.email}</div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (user) => <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>,
    },
    {
      key: "status",
      header: "Status",
      render: (user) => <Badge variant={user.status === "active" ? "default" : "destructive"}>{user.status}</Badge>,
    },
    {
      key: "createdAt",
      header: "Created",
      sortable: true,
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
              setDialogType("disable")
            }}
            className="text-orange-600 hover:text-orange-700"
          >
            {user.status === "active" ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
          </Button>
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
          onSearch={(query) => {
            // Implement search functionality
            console.log("Search:", query)
          }}
          actions={
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Customer
            </Button>
          }
          emptyState={
            <div className="text-center py-8">
              <p className="text-gray-500">No customers found</p>
            </div>
          }
        />
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={dialogType === "delete"}
        onClose={() => {
          setDialogType(null)
          setSelectedUser(null)
        }}
        onConfirm={handleDeleteUser}
        title="Delete Customer"
        message={`Are you sure you want to delete ${selectedUser?.name}? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
        isLoading={isProcessing}
      />

      {/* Disable/Enable Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={dialogType === "disable"}
        onClose={() => {
          setDialogType(null)
          setSelectedUser(null)
        }}
        onConfirm={handleToggleUserStatus}
        title={selectedUser?.status === "active" ? "Disable Customer" : "Enable Customer"}
        message={`Are you sure you want to ${selectedUser?.status === "active" ? "disable" : "enable"} ${selectedUser?.name}?`}
        confirmText={selectedUser?.status === "active" ? "Disable" : "Enable"}
        type="warning"
        isLoading={isProcessing}
      />
    </div>
  )
}
