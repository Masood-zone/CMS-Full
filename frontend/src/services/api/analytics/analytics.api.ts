import { apiClient } from "../../root"

/**
 * Fetch admin analytics
 */
export const fetchAdminAnalytics = async () => {
  try {
    const response = await apiClient.get("/analytics/admin-dashboard")
    return response.data
  } catch (error) {
    console.error("Error fetching admin analytics:", error)
    throw error
  }
}
