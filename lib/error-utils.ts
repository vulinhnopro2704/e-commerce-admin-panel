import { toast } from "sonner"

interface ApiError {
  type?: string
  title?: string
  status?: number
  traceId?: string
  errors?: Record<string, string[]>
  msgNo?: string
  listError?: Record<string, string>
}

export function handleApiError(error: unknown) {
  console.error("API Error:", error)
  
  // Default error message
  let title = "An error occurred"
  let description = "Please try again later"
  let status = 500
  
  try {
    // Try to parse error response
    if (error instanceof Error) {
      // Check if it's a fetch error with response data
      const errorMessage = error.message
      
      // Try to extract JSON from error message if it contains one
      const jsonMatch = errorMessage.match(/{.*}/s)
      if (jsonMatch) {
        const apiError = JSON.parse(jsonMatch[0]) as ApiError
        
        // Extract error details
        title = apiError.title || "Error"
        status = apiError.status || 500
        
        // Format validation errors
        if (apiError.errors) {
          const firstErrorField = Object.keys(apiError.errors)[0]
          const firstErrorMessage = apiError.errors[firstErrorField][0]
          description = `${firstErrorField}: ${firstErrorMessage}`
        } else if (apiError.listError) {
          const firstErrorField = Object.keys(apiError.listError)[0]
          description = apiError.listError[firstErrorField]
        } else {
          description = errorMessage
        }
      } else {
        title = "Request Failed"
        description = errorMessage.substring(0, 100)
      }
    } else if (typeof error === 'object' && error !== null) {
      // Try to handle plain error object
      const apiError = error as ApiError
      
      title = apiError.title || "Error"
      status = apiError.status || 500
      
      if (apiError.errors) {
        const firstErrorField = Object.keys(apiError.errors)[0]
        const firstErrorMessage = apiError.errors[firstErrorField][0]
        description = `${firstErrorField}: ${firstErrorMessage}`
      } else if (apiError.listError) {
        const firstErrorField = Object.keys(apiError.listError)[0]
        description = apiError.listError[firstErrorField]
      }
    }
  } catch (parsingError) {
    console.error("Error parsing API error:", parsingError)
  }
  
  // Show toast notification
  toast.error(`${title} (${status})`, {
    description: description,
    duration: 5000,
  })
  
  return { title, description, status }
}
