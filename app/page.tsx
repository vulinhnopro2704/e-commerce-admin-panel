"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts"
import { Users, Package, ShoppingCart, DollarSign, TrendingUp, TrendingDown, BarChart as BarChartIcon, List } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { DashboardStats, CategorySales } from "@/types"
import Header from "@/components/layout/header"
import { apiClient } from "@/lib/api"
import CustomerMap from "@/components/ui/customer-map"
import { truncateText } from "@/lib/utils"

// More distinct colors for categories
const CATEGORY_COLORS = [
  "#8B5CF6", // Purple (primary)
  "#3B82F6", // Blue
  "#EF4444", // Red
  "#10B981", // Green
  "#F59E0B", // Yellow
  "#EC4899", // Pink
  "#6366F1", // Indigo
  "#14B8A6", // Teal
  "#F97316", // Orange
  "#8B5CF6", // Purple (repeat with different opacity)
].map((color, i) => {
  const opacity = 1 - (i * 0.05);
  return color + Math.round(opacity * 255).toString(16).padStart(2, '0');
});

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [salesViewMode, setSalesViewMode] = useState<"chart" | "list">("chart")
  const [categoryData, setCategoryData] = useState<CategorySales[]>([])

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
        
        // Fetch dashboard stats
        const stats = await apiClient.getDashboardStats()
        setStats(stats)
        
        // Fetch sales by category data
        const categoryData = await apiClient.getSalesByCategory()
        setCategoryData(categoryData)
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

  // Transform the most sold products data for chart display
  const transformedMostSoldProducts = stats?.mostSoldProducts?.map(product => ({
    name: truncateText(product.name, 15),
    quantity: product.sold,
    price: product.minPrice,
    rating: product.rating,
    imageUrl: product.imageUrl,
    fullName: product.name
  })) || []

  // Sort transformed products by quantity for color assignment
  const sortedProducts = [...transformedMostSoldProducts].sort((a, b) => b.quantity - a.quantity);
  
  // Generate colors based on quantity (darker = more sales)
  const productColors = sortedProducts.map((product, index) => {
    // Calculate color intensity based on position in sorted array
    const intensity = 0.4 + (0.6 * (index / (sortedProducts.length - 1 || 1)));
    // Invert the intensity so higher sales = darker color
    const adjustedIntensity = 1 - intensity;
    return `rgba(139, 92, 246, ${adjustedIntensity + 0.4})`;
  });

  // Prepare category data for visualization
  const topCategories = [...(categoryData || [])]
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 10)
    .map(category => ({
      name: truncateText(category.name, 20),
      value: category.sold,
      fullName: category.name,
      id: category.id
    }));

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
        {/* Sales by Category with Toggle */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Sales by Category</CardTitle>
                <CardDescription>Top 10 categories by sales volume</CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant={salesViewMode === "chart" ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setSalesViewMode("chart")}
                >
                  <BarChartIcon className="h-4 w-4 mr-1" />
                  Chart
                </Button>
                <Button 
                  variant={salesViewMode === "list" ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setSalesViewMode("list")}
                >
                  <List className="h-4 w-4 mr-1" />
                  List
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {salesViewMode === "chart" ? (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={topCategories} layout="vertical" margin={{ left: 20, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      width={120}
                      tickFormatter={(value) => truncateText(value, 15)}
                    />
                    <Tooltip 
                      formatter={(value) => [`${value.toLocaleString()} items`, "Sold"]}
                      labelFormatter={(label) => {
                        const item = topCategories.find(cat => cat.name === label);
                        return item?.fullName || label;
                      }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="value" 
                      name="Units Sold" 
                      radius={[0, 4, 4, 0]}
                    >
                      {topCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Units Sold</TableHead>
                        <TableHead className="text-right">Percentage</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categoryData
                        .sort((a, b) => b.sold - a.sold)
                        .slice(0, 10)
                        .map((category, index) => {
                          const totalSold = categoryData.reduce((sum, cat) => sum + cat.sold, 0);
                          const percentage = (category.sold / totalSold) * 100;
                          
                          return (
                            <TableRow key={category.id}>
                              <TableCell className="font-medium">
                                <div className="flex items-center">
                                  <span 
                                    className="w-3 h-3 rounded-full mr-2" 
                                    style={{ backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }}
                                  />
                                  {category.name}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                {category.sold.toLocaleString()}
                              </TableCell>
                              <TableCell className="text-right">
                                <Badge variant="outline" className="font-normal">
                                  {percentage.toFixed(1)}%
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Most Sold Products Chart */}
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
                    data={sortedProducts}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="quantity"
                  >
                    {sortedProducts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={productColors[index]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value.toLocaleString()} sold`, "Quantity"]}
                    labelFormatter={(name) => {
                      const product = transformedMostSoldProducts.find(p => p.name === name);
                      return product?.fullName || name;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Most Sold Products List */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <Card>
          <CardHeader>
            <CardTitle>Most Sold Products Details</CardTitle>
            <CardDescription>Complete information about best-selling products</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {stats?.mostSoldProducts?.map((product, index) => (
                <Card key={product.id} className="overflow-hidden">
                  <div className="aspect-w-16 aspect-h-9 bg-gray-100 relative h-48">
                    <img 
                      src={product.imageUrl} 
                      alt={product.name} 
                      className="object-contain w-full h-full p-2"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=No+Image';
                      }} 
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-sm mb-1 line-clamp-2" title={product.name}>
                      {truncateText(product.name, 35)}
                    </h3>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs font-bold text-green-600">${product.minPrice}</span>
                      <div className="flex items-center">
                        <span className="text-xs text-amber-500">★ {product.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    <div 
                      className="mt-2 text-xs font-semibold text-purple-600 rounded-full px-2 py-1 inline-block"
                      style={{ 
                        backgroundColor: productColors[sortedProducts.findIndex(p => 
                          p.name === truncateText(product.name, 15)
                        )] + '30'  // Add 30 for transparency
                      }}
                    >
                      {product.sold.toLocaleString()} sold
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Customer Distribution Map */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
        <CustomerMap customers={customerLocations} height="500px" />
      </motion.div>
    </div>
  )
}
