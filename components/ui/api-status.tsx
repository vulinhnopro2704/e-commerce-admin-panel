"use client"

import { useState, useEffect } from "react"
import { AlertCircle, CheckCircle, Clock, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { API_ENDPOINTS } from "@/constants/endpoints"

interface ApiStatusProps {
  onRetry?: () => void
}

export default function ApiStatus({ onRetry }: ApiStatusProps) {
  const [status, setStatus] = useState<"checking" | "online" | "offline" | "warning">("checking")
  const [message, setMessage] = useState("")

  const checkApiStatus = async () => {
    setStatus("checking")

    try {
      const response = await fetch(API_ENDPOINTS.INVENTORY.CATEGORIES, {
        method: "HEAD", // Just check if endpoint is reachable
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      })

      const contentType = response.headers.get("content-type")

      if (contentType && contentType.includes("text/html")) {
        setStatus("warning")
        setMessage("API is returning HTML (ngrok verification page). Please visit the API URL in browser first.")
      } else if (response.ok) {
        setStatus("online")
        setMessage("API is online and responding")
      } else {
        setStatus("offline")
        setMessage(`API returned status: ${response.status}`)
      }
    } catch (error) {
      setStatus("offline")
      setMessage(error instanceof Error ? error.message : "Failed to connect to API")
    }
  }

  useEffect(() => {
    checkApiStatus()
  }, [])

  const getStatusIcon = () => {
    switch (status) {
      case "checking":
        return <Clock className="h-4 w-4 animate-pulse" />
      case "online":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case "offline":
        return <AlertCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case "checking":
        return "bg-blue-100 text-blue-800"
      case "online":
        return "bg-green-100 text-green-800"
      case "warning":
        return "bg-yellow-100 text-yellow-800"
      case "offline":
        return "bg-red-100 text-red-800"
    }
  }

  if (status === "online") return null // Don't show when everything is working

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <CardTitle className="text-sm">API Status</CardTitle>
            <Badge className={getStatusColor()}>{status}</Badge>
          </div>
          <Button variant="outline" size="sm" onClick={checkApiStatus}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Check
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <CardDescription className="mb-3">{message}</CardDescription>

        {status === "warning" && (
          <div className="space-y-2">
            <p className="text-sm text-yellow-700">
              <strong>Solution:</strong> Open this URL in a new tab to bypass ngrok verification:
            </p>
            <code className="block p-2 bg-yellow-50 rounded text-xs break-all">
              {API_ENDPOINTS.INVENTORY.CATEGORIES}
            </code>
            <Button variant="outline" size="sm" onClick={onRetry}>
              Try Again
            </Button>
          </div>
        )}

        {status === "offline" && onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Retry
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
