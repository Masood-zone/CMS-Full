import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import * as prepaymentsApi from "./prepayments.api"
import type { CreatePrepayment, UpdatePrepayment } from "./prepayments.types" // Assuming these types are declared in prepayments.types.ts

/**
 * Query: Fetch all prepayments
 */
export const useFetchPrepayments = () => {
  return useQuery(["prepayments"], () => prepaymentsApi.fetchPrepayments(), {
    onError: (error) => {
      console.error(error)
      toast.error("Failed to fetch prepayments.")
    },
  })
}

/**
 * Query: Fetch all prepayments by class
 */
export const useFetchPrepaymentsByClass = (classId: number) => {
  return useQuery(["prepayments", classId], () => prepaymentsApi.fetchPrepaymentsByClass(classId), {
    onError: (error) => {
      console.error(error)
      toast.error("Failed to fetch prepayments for this class.")
    },
  })
}

/**
 * Mutation: Create a prepayment.
 */
export const useCreatePrepayment = () => {
  const queryClient = useQueryClient()
  return useMutation((data: CreatePrepayment) => prepaymentsApi.createPrepayment(data), {
    onSuccess: () => {
      toast.success("Prepayment created successfully!")
      queryClient.invalidateQueries(["prepayments"])
      queryClient.invalidateQueries(["records"])
    },
    onError: (error) => {
      console.error(error)
      toast.error("Failed to create prepayment.")
    },
  })
}

/**
 * Mutation: Update a prepayment.
 */
export const useUpdatePrepayment = () => {
  const queryClient = useQueryClient()
  return useMutation((data: UpdatePrepayment) => prepaymentsApi.updatePrepayment(data.id, data), {
    onSuccess: () => {
      toast.success("Prepayment updated successfully!")
      queryClient.invalidateQueries(["records"])
      queryClient.invalidateQueries(["prepayments"])
    },
    onError: (error) => {
      console.error(error)
      toast.error("Failed to update prepayment.")
    },
  })
}
