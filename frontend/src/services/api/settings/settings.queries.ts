import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import * as settingsApi from "./settings.api"
import type { RecordsAmount } from "./settings.types" // Declare the RecordsAmount variable

/**
 * Query: Fetch records amount.
 */
export const useFetchRecordsAmount = () => {
  return useQuery(["recordsAmount"], settingsApi.fetchRecordsAmount, {
    onError: (error) => {
      console.error(error)
      toast.error("Failed to fetch records amount.")
    },
  })
}

/**
 * Query: Get preset amount.
 */
export const useGetPresetAmount = () => {
  return useQuery(["presetAmount"], settingsApi.getPresetAmount, {
    onError: (error) => {
      console.error(error)
      toast.error("Failed to fetch preset amount.")
    },
  })
}

/**
 * Mutation: Create settings amount.
 */
export const useCreateRecordsAmount = () => {
  const queryClient = useQueryClient()
  return useMutation((data: RecordsAmount) => settingsApi.createRecordsAmount(data), {
    onSuccess: () => {
      toast.success("Preset amount created successfully!")
      queryClient.invalidateQueries(["records"])
    },
    onError: (error) => {
      console.error(error)
      toast.error("Failed to create preset amount.")
    },
  })
}

/**
 * Mutation: Update settings amount.
 */
export const useUpdateRecordsAmount = () => {
  const queryClient = useQueryClient()
  return useMutation((data: RecordsAmount) => settingsApi.updateRecordsAmount(data), {
    onSuccess: () => {
      toast.success("Preset amount updated successfully!")
      queryClient.invalidateQueries(["records"])
    },
    onError: (error) => {
      console.error(error)
      toast.error("Failed to update preset amount.")
    },
  })
}
