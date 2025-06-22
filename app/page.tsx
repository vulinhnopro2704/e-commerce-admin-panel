"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Users, Package, ShoppingCart, DollarSign, TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { DashboardStats } from "@/types"
import Header from "@/components/layout/header"
import { apiClient } from "@/lib/api"
import CustomerMap from "@/components/ui/customer-map"

const COLORS = ["#8B5CF6", "#A78BFA", "#C4B5FD", "#DDD6FE", "#EDE9FE"]

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Sample customer data for Vietnam cities
  const customerLocations = [
    { id: 1, lat: 21.0285, lng: 105.8542, count: 150, city: "Hà Nội", address: "Hoàn Kiếm, Hà Nội" },
    { id: 2, lat: 10.8231, lng: 106.6297, count: 200, city: "TP.HCM", address: "Quận 1, TP.HCM" },
    { id: 3, lat: 16.0544, lng: 108.2022, count: 80, city: "Đà Nẵng", address: "Hải Châu, Đà Nẵng" },
    { id: 4, lat: 20.8449, lng: 106.6881, count: 60, city: "Hải Phòng", address: "Ngô Quyền, Hải Phòng" },
    { id: 5, lat: 10.0452, lng: 105.7469, count: 90, city: "Cần Thơ", address: "Ninh Kiều, Cần Thơ" },
    { id: 6, lat: 12.2585, lng: 109.0526, count: 45, city: "Nha Trang", address: "Nha Trang, Khánh Hòa" },
    { id: 7, lat: 21.5937, lng: 105.8455, count: 35, city: "Thái Nguyên", address: "Thái Nguyên" },
    { id: 8, lat: 18.3351, lng: 105.9069, count: 55, city: "Vinh", address: "Vinh, Nghệ An" },
    { id: 9, lat: 11.9404, lng: 108.4583, count: 40, city: "Đà Lạt", address: "Đà Lạt, Lâm Đồng" },
    { id: 10, lat: 13.7563, lng: 109.2177, count: 25, city: "Quy Nhon", address: "Quy Nhon, Bình Định" },
  ]

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        const stats = await apiClient.getDashboardStats()
        setStats(stats)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      change: "+12%",
      changeType: "positive" as const,
    },
    {
      title: "Total Products",
      value: stats?.totalProducts || 0,
      icon: Package,
      change: "+8%",
      changeType: "positive" as const,
    },
    {
      title: "Total Orders",
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      change: "+23%",
      changeType: "positive" as const,
    },
    {
      title: "Total Revenue",
      value: `$${(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      change: "+15%",
      changeType: "positive" as const,
    },
  ]

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <Header title="Dashboard" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <Header title="Dashboard" />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="flex items-center mt-4">
                  {stat.changeType === "positive" ? (
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      stat.changeType === "positive" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Category */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader>
              <CardTitle>Sales by Category</CardTitle>
              <CardDescription>Revenue breakdown by product categories</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats?.salesByCategory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, "Sales"]} />
                  <Bar dataKey="sales" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Most Sold Products */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
          <Card>
            <CardHeader>
              <CardTitle>Most Sold Products</CardTitle>
              <CardDescription>Top selling products by quantity</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats?.mostSoldProducts}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ product, percent }) => `${product} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="quantity"
                  >
                    {stats?.mostSoldProducts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Customer Distribution Map */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <CustomerMap customers={customerLocations} height="500px" />
      </motion.div>

      {/* Recent Activity - moved after map */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system activities and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: "New user registered", user: "john.doe@example.com", time: "2 minutes ago" },
                { action: "Product updated", user: "iPhone 15 Pro", time: "5 minutes ago" },
                { action: "Order completed", user: "Order #12345", time: "10 minutes ago" },
                { action: "Category created", user: "Smart Home", time: "15 minutes ago" },
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.user}</p>
                  </div>
                  <span className="text-xs text-gray-400">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
