import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"
import * as classesApi from "./classes.api"
import type { Class } from "./classes.types" // Declare the Class variable

/**
 * Query: Fetch all classes.
 */
export const useFetchClasses = () => {
  return useQuery(["classes"], classesApi.fetchClasses, {
    onError: (error) => {
      console.error(error)
      toast.error("Failed to fetch classes.")
    },
  })
}

/**
 * Query: Fetch class by id.
 */
export const useFetchClassById = (id: number) => {
  return useQuery(["classes", id], () => classesApi.fetchClass(id), {
    onError: (error) => {
      console.error(error)
      toast.error("Failed to fetch class.")
    },
  })
}

/**
 * Mutation: Create a new class.
 */
export const useCreateClass = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation(
    (data: { name: string; description: string; supervisorId: number }) => classesApi.createClass(data),
    {
      onSuccess: () => {
        toast.success("Class created successfully!")
        // Invalidate the query to refresh the table
        queryClient.invalidateQueries(["classes"])
        //Navigate to the classes page after creating a class
        navigate("/admin/classes")
      },
      onError: (error) => {
        console.error(error)
        toast.error("Failed to create class. Please try again.")
      },
    },
  )
}

/**
 * Mutation: Update a class.
 */
export const useUpdateClass = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation((data: Class) => classesApi.updateClass(data), {
    onSuccess: () => {
      toast.success("Class updated successfully!")
      // Invalidate the query to refresh the table
      queryClient.invalidateQueries(["classes"])
      //Navigate to the classes page after updating a class
      navigate("/admin/classes")
    },
    onError: (error) => {
      console.error(error)
      toast.error("Failed to update class. Please try again.")
    },
  })
}
