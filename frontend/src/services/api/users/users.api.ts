import { apiClient } from "../../root"
import type { FormUser } from "../types" // Assuming FormUser is declared in a types file

/**
 * Update User
 */
export const updateUser = async (data: FormUser) => {
  try {
    const response = await apiClient.put(`/users/${data.id}`, data)
    return response.data
  } catch (error) {
    console.error("Error updating user:", error)
    throw error
  }
}

/**
 * Fetch all supervisors.
 */
export const fetchSupervisors = async () => {
  try {
    const response = await apiClient.get("/users")
    return response.data
  } catch (error) {
    console.error("Error fetching supervisors:", error)
    throw error
  }
}

/**
 * Fetch supervisor
 */
export const fetchSupervisor = async (id: number) => {
  try {
    const response = await apiClient.get(`/users/${id}`)
    return response.data
  } catch (error) {
    console.error("Error fetching teacher:", error)
    throw error
  }
}
