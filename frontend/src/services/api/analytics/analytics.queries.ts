import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import * as analyticsApi from "./analytics.api"

/**
 * Query: Admin's Analytics
 */
export const useAdminDashboardAnalytics = () => {
  return useQuery(["adminAnalytics"], analyticsApi.fetchAdminAnalytics, {
    onError: (error) => {
      console.error(error)
      toast.error("Failed to fetch admin analytics.")
    },
  })
}
