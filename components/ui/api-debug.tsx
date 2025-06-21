"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { API_ENDPOINTS } from "@/constants/endpoints"
import { Textarea } from "@/components/ui/textarea"

export default function ApiDebug() {
  const [testResults, setTestResults] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(false)

  const testEndpoint = async (name: string, url: string) => {
    setIsLoading(true)
    const startTime = Date.now()

    try {
      console.log(`Testing ${name}: ${url}`)

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
          "User-Agent": "Mozilla/5.0 (compatible; Admin-Panel/1.0)",
        },
        mode: "cors",
      })

      const endTime = Date.now()
      const duration = endTime - startTime

      const contentType = response.headers.get("content-type")
      const responseText = await response.text()

      setTestResults((prev) => ({
        ...prev,
        [name]: {
          status: response.status,
          statusText: response.statusText,
          contentType,
          duration,
          responseSize: responseText.length,
          responsePreview: responseText.substring(0, 200),
          success: response.ok,
          headers: Object.fromEntries(response.headers.entries()),
        },
      }))
    } catch (error) {
      const endTime = Date.now()
      const duration = endTime - startTime

      setTestResults((prev) => ({
        ...prev,
        [name]: {
          error: error instanceof Error ? error.message : "Unknown error",
          duration,
          success: false,
        },
      }))
    }

    setIsLoading(false)
  }

  const testAllEndpoints = async () => {
    await testEndpoint("Categories", API_ENDPOINTS.INVENTORY.CATEGORIES)
    await testEndpoint("Products", API_ENDPOINTS.SHOPPING.PRODUCTS + "?PageIndex=1&PageSize=3")
    // Test different sort parameters to find valid ones
    await testEndpoint(
      "Products (sort by name)",
      API_ENDPOINTS.SHOPPING.PRODUCTS + "?PageIndex=1&PageSize=3&SortBy=name",
    )
    await testEndpoint("Products (sort by id)", API_ENDPOINTS.SHOPPING.PRODUCTS + "?PageIndex=1&PageSize=3&SortBy=id")
    await testEndpoint(
      "Products (sort by price)",
      API_ENDPOINTS.SHOPPING.PRODUCTS + "?PageIndex=1&PageSize=3&SortBy=price",
    )
    await testEndpoint("Products (no sort)", API_ENDPOINTS.SHOPPING.PRODUCTS + "?PageIndex=1&PageSize=3&SortBy=")
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>API Debug Tool</CardTitle>
        <CardDescription>Test API endpoints and diagnose connection issues</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Button onClick={testAllEndpoints} disabled={isLoading}>
            {isLoading ? "Testing..." : "Test All Endpoints"}
          </Button>
          <Button
            variant="outline"
            onClick={() => testEndpoint("Categories", API_ENDPOINTS.INVENTORY.CATEGORIES)}
            disabled={isLoading}
          >
            Test Categories
          </Button>
          <Button
            variant="outline"
            onClick={() => testEndpoint("Products", API_ENDPOINTS.SHOPPING.PRODUCTS + "?PageIndex=1&PageSize=3")}
            disabled={isLoading}
          >
            Test Products
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              testEndpoint("Products (no sort)", API_ENDPOINTS.SHOPPING.PRODUCTS + "?PageIndex=1&PageSize=3")
            }
            disabled={isLoading}
          >
            Test No Sort
          </Button>
        </div>

        {Object.entries(testResults).map(([name, result]) => (
          <Card key={name}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{name}</CardTitle>
                <Badge variant={result.success ? "default" : "destructive"}>
                  {result.success ? "Success" : "Failed"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 text-sm">
                {result.status && (
                  <div>
                    <strong>Status:</strong> {result.status} {result.statusText}
                  </div>
                )}
                {result.duration && (
                  <div>
                    <strong>Duration:</strong> {result.duration}ms
                  </div>
                )}
                {result.contentType && (
                  <div>
                    <strong>Content-Type:</strong> {result.contentType}
                  </div>
                )}
                {result.responseSize && (
                  <div>
                    <strong>Response Size:</strong> {result.responseSize} bytes
                  </div>
                )}
                {result.error && (
                  <div className="text-red-600">
                    <strong>Error:</strong> {result.error}
                  </div>
                )}
                {result.responsePreview && (
                  <div>
                    <strong>Response Preview:</strong>
                    <Textarea value={result.responsePreview} readOnly className="mt-1 h-20 text-xs font-mono" />
                  </div>
                )}
                {result.headers && (
                  <details>
                    <summary className="cursor-pointer font-medium">Response Headers</summary>
                    <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-auto">
                      {JSON.stringify(result.headers, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  )
}
