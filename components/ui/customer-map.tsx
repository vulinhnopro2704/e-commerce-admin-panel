"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false })
const CircleMarker = dynamic(() => import("react-leaflet").then((mod) => mod.CircleMarker), { ssr: false })
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false })
const Tooltip = dynamic(() => import("react-leaflet").then((mod) => mod.Tooltip), { ssr: false })
const ZoomControl = dynamic(() => import("react-leaflet").then((mod) => mod.ZoomControl), { ssr: false })
const Rectangle = dynamic(() => import("react-leaflet").then((mod) => mod.Rectangle), { ssr: false })

interface CustomerLocation {
  id: number
  lat: number
  lng: number
  count: number
  city?: string
  address?: string
}

interface CustomerMapProps {
  customers: CustomerLocation[]
  height?: string
}

export default function CustomerMap({ customers, height = "400px" }: CustomerMapProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)

    // Load Leaflet CSS
    if (typeof window !== "undefined") {
      const link = document.createElement("link")
      link.rel = "stylesheet"
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      document.head.appendChild(link)
    }
  }, [])

  // Function to get circle size based on customer count
  const getCircleSize = (count: number) => {
    if (count <= 30) return 8
    if (count <= 80) return 15
    if (count <= 150) return 25
    return 35
  }

  // Function to get circle color based on customer count
  const getCircleColor = (count: number) => {
    if (count <= 30) return "#3B82F6" // Blue
    if (count <= 80) return "#EAB308" // Yellow
    if (count <= 150) return "#F97316" // Orange
    return "#EF4444" // Red
  }

  // Function to get circle opacity based on customer count
  const getCircleOpacity = (count: number) => {
    const maxCount = Math.max(...customers.map((c) => c.count))
    return Math.max(0.4, count / maxCount)
  }

  if (!isClient) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Customer Distribution Map</CardTitle>
          <CardDescription>Geographic distribution of customers across Vietnam</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center bg-gray-100 rounded-lg" style={{ height }}>
            <div className="text-gray-500">Loading map...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Vietnam center coordinates - adjusted to include all territories
  const vietnamCenter: [number, number] = [14.058, 110.2772]
  
  // Set bounds for Vietnam territory including Hoang Sa and Truong Sa
  const vietnamBounds: [[number, number], [number, number]] = [
    [6.0, 102.0],  // Southwest corner - expanded to include Truong Sa
    [23.5, 118.0]  // Northeast corner - expanded to include Hoang Sa
  ]

  // Coordinates for highlighting important Vietnamese territories
  const hoangSaCoords: [[number, number], [number, number]] = [
    [15.5, 111.0],
    [17.0, 113.0]
  ]
  
  const truongSaCoords: [[number, number], [number, number]] = [
    [8.0, 111.5],
    [12.0, 117.5]
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Distribution Map</CardTitle>
        <CardDescription>
          Geographic distribution of {customers.length} customer locations across Vietnam territory
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ height }} className="rounded-lg overflow-hidden border">
          <MapContainer
            center={vietnamCenter}
            zoom={5}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={true}
            maxBounds={vietnamBounds}
            minZoom={5}
            maxZoom={10}
            zoomControl={false}
            attributionControl={false}
            bounds={vietnamBounds}
          >
            {/* Using CartoDB Positron map which is more minimal and neutral */}
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
            />
            
            <ZoomControl position="topright" />

            {/* Highlight Vietnam's island territories */}
            <Rectangle 
              bounds={hoangSaCoords} 
              pathOptions={{ color: '#10B981', weight: 1, fillOpacity: 0.1 }} 
            >
              <Tooltip direction="center" permanent opacity={0.9}>
                <div className="text-center">
                  <div className="font-semibold text-xs">Hoàng Sa</div>
                  <div className="text-xs text-gray-600">(Paracel Islands)</div>
                </div>
              </Tooltip>
            </Rectangle>
            
            <Rectangle 
              bounds={truongSaCoords} 
              pathOptions={{ color: '#10B981', weight: 1, fillOpacity: 0.1 }} 
            >
              <Tooltip direction="center" permanent opacity={0.9}>
                <div className="text-center">
                  <div className="font-semibold text-xs">Trường Sa</div>
                  <div className="text-xs text-gray-600">(Spratly Islands)</div>
                </div>
              </Tooltip>
            </Rectangle>

            {/* Circle markers for each customer location */}
            {customers.map((customer) => (
              <CircleMarker
                key={customer.id}
                center={[customer.lat, customer.lng]}
                radius={getCircleSize(customer.count)}
                pathOptions={{
                  color: getCircleColor(customer.count),
                  fillColor: getCircleColor(customer.count),
                  fillOpacity: getCircleOpacity(customer.count),
                  weight: 2,
                  opacity: 0.8,
                }}
              >
                <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
                  <div className="text-center">
                    <div className="font-semibold text-sm">{customer.city}</div>
                    <div className="text-xs text-gray-600">{customer.count} customers</div>
                  </div>
                </Tooltip>

                <Popup>
                  <div className="p-2">
                    <h3 className="font-semibold text-sm">📍 {customer.city}</h3>
                    <p className="text-xs text-gray-600 mt-1">{customer.address}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="px-2 py-1 bg-purple-100 rounded text-xs">
                        <strong>{customer.count}</strong> customers
                      </div>
                      <div
                        className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: getCircleColor(customer.count) }}
                      ></div>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>

        {/* Vietnam territorial note */}
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded mt-2 mb-2">
          <strong>Note:</strong> Map displays Vietnam's full territorial claims including Hoàng Sa (Paracel Islands) and Trường Sa (Spratly Islands).
        </div>

        {/* Legend */}
        <div className="mt-4 space-y-3">
          {/* Color and size legend */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Customer Density</h4>
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-xs">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  <span>1-30 customers</span>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <div className="w-6 h-6 bg-yellow-500 rounded-full"></div>
                  <span>31-80 customers</span>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <div className="w-8 h-8 bg-orange-500 rounded-full"></div>
                  <span>81-150 customers</span>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <div className="w-10 h-10 bg-red-500 rounded-full"></div>
                  <span>150+ customers</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Statistics</h4>
              <div className="space-y-1 text-xs text-gray-600">
                <div>
                  Total locations: <strong>{customers.length}</strong>
                </div>
                <div>
                  Total customers: <strong>{customers.reduce((sum, c) => sum + c.count, 0)}</strong>
                </div>
                <div>
                  Average per location:{" "}
                  <strong>{Math.round(customers.reduce((sum, c) => sum + c.count, 0) / customers.length)}</strong>
                </div>
                <div>
                  Largest location: <strong>{Math.max(...customers.map((c) => c.count))} customers</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
            💡 <strong>Tip:</strong> Hover over circles to see quick info, click for detailed information. Circle size
            and color represent customer density.
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
