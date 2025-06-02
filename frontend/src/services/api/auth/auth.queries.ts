import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"
import * as authApi from "./auth.api"
import { useAuthStore } from "@/store/authStore"

/**
 * Mutation: Login user
 */
export const useLogin = () => {
  const navigate = useNavigate()
  const { setUser, setToken, setIsAuthenticated } = useAuthStore()

  return useMutation((credentials: { email: string; password: string }) => authApi.loginUser(credentials), {
    onSuccess: (data) => {
      setUser(data.user)
      setToken(data.token)
      setIsAuthenticated(true)

      toast.success("Login successful!")

      // Redirect based on user role
      if (data.user.role === "SUPER_ADMIN" || data.user.role === "ADMIN") {
        navigate("/admin")
      } else if (data.user.role === "TEACHER") {
        navigate("/teacher")
      }
    },
    onError: (error: any) => {
      console.error(error)
      toast.error(error.response?.data?.message || "Login failed. Please check your credentials.")
    },
  })
}

/**
 * Mutation: Logout user
 */
export const useLogout = () => {
  const navigate = useNavigate()
  const { clearAuth } = useAuthStore()

  return useMutation(authApi.logoutUser, {
    onSuccess: () => {
      clearAuth()
      toast.success("Logged out successfully!")
      navigate("/")
    },
    onError: (error) => {
      console.error(error)
      toast.error("Failed to logout. Please try again.")
      // Force logout anyway
      clearAuth()
      navigate("/")
    },
  })
}

/**
 * Mutation: Request password reset
 */
export const useRequestPasswordReset = () => {
  const navigate = useNavigate()

  return useMutation((email: string) => authApi.requestPasswordReset(email), {
    onSuccess: (data) => {
      toast.success("Password reset email sent!")
      navigate("/verify-otp", { state: { email: data.email } })
    },
    onError: (error: any) => {
      console.error(error)
      toast.error(error.response?.data?.message || "Failed to send reset email. Please try again.")
    },
  })
}

/**
 * Mutation: Verify OTP
 */
export const useVerifyOTP = () => {
  const navigate = useNavigate()

  return useMutation((data: { email: string; otp: string }) => authApi.verifyOTP(data), {
    onSuccess: (_, variables) => {
      toast.success("OTP verified successfully!")
      navigate("/reset-password", { state: { email: variables.email, otp: variables.otp } })
    },
    onError: (error: any) => {
      console.error(error)
      toast.error(error.response?.data?.message || "Invalid OTP. Please try again.")
    },
  })
}

/**
 * Mutation: Reset password
 */
export const useResetPassword = () => {
  const navigate = useNavigate()

  return useMutation(
    (data: {
      email: string
      otp: string
      password: string
      confirmPassword: string
    }) => authApi.resetPassword(data),
    {
      onSuccess: () => {
        toast.success("Password reset successfully!")
        navigate("/")
      },
      onError: (error: any) => {
        console.error(error)
        toast.error(error.response?.data?.message || "Failed to reset password. Please try again.")
      },
    },
  )
}
