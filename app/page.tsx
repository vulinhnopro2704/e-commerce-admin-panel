"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts"
import { Users, Package, ShoppingCart, DollarSign, BarChart as BarChartIcon, List, RefreshCw } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { DashboardStats, CategorySales, StatisticsResponse } from "@/types"
import Header from "@/components/layout/header"
import { apiClient } from "@/lib/api"
import CustomerMap from "@/components/ui/customer-map"
import { truncateText } from "@/lib/utils"
import { cacheUtils, CACHE_KEYS } from "@/lib/cache-utils"
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

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

// Cache duration settings (in milliseconds)
const CACHE_DURATION = {
  STATS: 15 * 60 * 1000, // 15 minutes
  LOCATIONS: 30 * 60 * 1000, // 30 minutes
  CATEGORIES: 20 * 60 * 1000, // 20 minutes
}

export interface CustomerLocation {
  id: number,
  lat: number,
  lng: number,
  count: number,
  province: string
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [statistics, setStatistics] = useState<StatisticsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [salesViewMode, setSalesViewMode] = useState<"chart" | "list">("chart")
  const [categoryData, setCategoryData] = useState<CategorySales[]>([])
  const [customerLocations, setCustomerLocations] = useState<CustomerLocation[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [usingCachedData, setUsingCachedData] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Format the last updated time
  const formattedLastUpdated = lastUpdated ? 
    `${lastUpdated.toLocaleDateString()} ${lastUpdated.toLocaleTimeString()}` : 
    'Never';

  const fetchDashboardData = async (forceRefresh = false) => {
    try {
      if (!forceRefresh) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
        // Clear cache when forcing a refresh
        cacheUtils.clearByPrefix(CACHE_KEYS.DASHBOARD_PREFIX);
      }
      
      // Try to get data from cache first
      let statsData = null;
      let statisticsData = null;
      let categoryDataResult = null;
      let locationsData = null;
      
      if (!forceRefresh) {
        statsData = cacheUtils.get<DashboardStats>(CACHE_KEYS.DASHBOARD_STATS, CACHE_DURATION.STATS);
        statisticsData = cacheUtils.get<StatisticsResponse>(CACHE_KEYS.STATISTICS, CACHE_DURATION.STATS);
        categoryDataResult = cacheUtils.get<CategorySales[]>(CACHE_KEYS.CATEGORY_DATA, CACHE_DURATION.CATEGORIES);
        locationsData = cacheUtils.get<CustomerLocation[]>(CACHE_KEYS.CUSTOMER_LOCATIONS, CACHE_DURATION.LOCATIONS);
        
        // Check if all data is available in cache
        if (statsData && statisticsData && categoryDataResult && locationsData) {
          setStats(statsData);
          setStatistics(statisticsData);
          setCategoryData(categoryDataResult);
          setCustomerLocations(locationsData);
          setUsingCachedData(true);
          
          // Get the timestamp of the cache
          const timestamp = localStorage.getItem(CACHE_KEYS.DASHBOARD_STATS);
          if (timestamp) {
            const cachedItem = JSON.parse(timestamp);
            setLastUpdated(new Date(cachedItem.timestamp));
          }
          
          setIsLoading(false);
          return;
        }
      }
      
      setUsingCachedData(false);
      
      // Fetch dashboard stats if not in cache or force refresh
      if (!statsData || forceRefresh) {
        const newStats = await apiClient.getDashboardStats();
        setStats(newStats);
        cacheUtils.set(CACHE_KEYS.DASHBOARD_STATS, newStats);
      } else {
        setStats(statsData);
      }
      
      // Fetch statistics if not in cache or force refresh
      if (!statisticsData || forceRefresh) {
        const newStatistics = await apiClient.getStatistics();
        setStatistics(newStatistics);
        cacheUtils.set(CACHE_KEYS.STATISTICS, newStatistics);
      } else {
        setStatistics(statisticsData);
      }
      
      // Fetch sales by category data if not in cache or force refresh
      if (!categoryDataResult || forceRefresh) {
        const newCategoryData = await apiClient.getSalesByCategory();
        setCategoryData(newCategoryData);
        cacheUtils.set(CACHE_KEYS.CATEGORY_DATA, newCategoryData);
      } else {
        setCategoryData(categoryDataResult);
      }
      
      // Fetch customer locations data if not in cache or force refresh
      if (!locationsData || forceRefresh) {
        const newLocationsData = await apiClient.getUserLocations();
        setCustomerLocations(newLocationsData);
        cacheUtils.set(CACHE_KEYS.CUSTOMER_LOCATIONS, newLocationsData);
      } else {
        setCustomerLocations(locationsData);
      }
      
      // Update last updated time
      setLastUpdated(new Date());
    } catch (error) {
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Function to handle manual refresh
  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  useEffect(() => {
    fetchDashboardData();
  }, [])

  // Updated stat cards without change indicators
  const statCards = [
    {
      title: "Total Users",
      value: statistics?.totalUsers || 0,
      icon: Users,
    },
    {
      title: "Total Products",
      value: statistics?.totalProducts || 0,
      icon: Package,
    },
    {
      title: "Total Orders",
      value: statistics?.totalOrders || 0,
      icon: ShoppingCart,
    },
    {
      title: "Total Revenue",
      value: `$${(statistics?.totalSales || 0).toLocaleString()}`,
      icon: DollarSign,
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
      <div className="flex items-center justify-between">
        <Header title="Dashboard" />
        <div className="flex items-center gap-4">
          {usingCachedData && (
            <TooltipProvider>
              <UITooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="py-1">
                    <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                    Cached
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Showing cached data from {formattedLastUpdated}</p>
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>
          )}
          <Button 
            size="sm"
            onClick={handleRefresh} 
            disabled={isRefreshing}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>

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
        <CustomerMap 
          customers={customerLocations.map(location => ({
            id: location.id,
            lat: location.lat,
            lng: location.lng,
            count: location.count,
            city: location.province, // Use province as city
            address: location.province // Use province as address
          }))} 
          height="500px" 
        />
      </motion.div>
    </div>
  )
}