interface JWTPayload {
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier": string
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress": string
    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": string
    exp: number
    iss: string
    aud: string
  }
  
  export interface DecodedUser {
    id: string
    email: string
    role: string
    exp: number
  }
  
  /**
   * Decode JWT token without verification (client-side only)
   * Note: This is for reading claims only, not for security validation
   */
  export function decodeJWT(token: string): DecodedUser | null {
    try {
      // Split the token into parts
      const parts = token.split(".")
      if (parts.length !== 3) {
        return null
      }
  
      // Decode the payload (second part)
      const payload = parts[1]
  
      // Add padding if needed for base64 decoding
      const paddedPayload = payload + "=".repeat((4 - (payload.length % 4)) % 4)
  
      // Decode base64
      const decodedPayload = atob(paddedPayload.replace(/-/g, "+").replace(/_/g, "/"))
  
      // Parse JSON
      const claims: JWTPayload = JSON.parse(decodedPayload)
  
      // Extract user information using the Microsoft identity claim URIs
      const user: DecodedUser = {
        id: claims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"],
        email: claims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"],
        role: claims["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"],
        exp: claims.exp,
      }
  
      return user
    } catch (error) {
      return null
    }
  }
  
  /**
   * Check if JWT token is expired
   */
  export function isTokenExpired(token: string): boolean {
    const decoded = decodeJWT(token)
    if (!decoded) return true
  
    const currentTime = Math.floor(Date.now() / 1000)
    return decoded.exp < currentTime
  }
  
  /**
   * Check if user has admin role
   */
  export function isAdminUser(token: string): boolean {
    const decoded = decodeJWT(token)
    if (!decoded) return false
  
    return decoded.role.toLowerCase() === "admin"
  }
  
  /**
   * Get user info from JWT token
   */
  export function getUserFromToken(token: string): DecodedUser | null {
    return decodeJWT(token)
  }
  