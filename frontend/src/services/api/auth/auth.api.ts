import { apiClient } from "../../root"

/**
 * Login user
 */
export const loginUser = async (credentials: { email: string; password: string }) => {
  try {
    const response = await apiClient.post("/login", credentials)
    return response.data
  } catch (error) {
    console.error("Login error:", error)
    throw error
  }
}

/**
 * Logout user
 */
export const logoutUser = async () => {
  try {
    const response = await apiClient.post("/logout")
    return response.data
  } catch (error) {
    console.error("Logout error:", error)
    throw error
  }
}

/**
 * Request password reset
 */
export const requestPasswordReset = async (email: string) => {
  try {
    const response = await apiClient.post("/forgot-password", { email })
    return response.data
  } catch (error) {
    console.error("Password reset request error:", error)
    throw error
  }
}

/**
 * Verify OTP
 */
export const verifyOTP = async (data: { email: string; otp: string }) => {
  try {
    const response = await apiClient.post("/verify-otp", data)
    return response.data
  } catch (error) {
    console.error("OTP verification error:", error)
    throw error
  }
}

/**
 * Reset password
 */
export const resetPassword = async (data: {
  email: string
  otp: string
  password: string
  confirmPassword: string
}) => {
  try {
    const response = await apiClient.post("/reset-password", data)
    return response.data
  } catch (error) {
    console.error("Password reset error:", error)
    throw error
  }
}
