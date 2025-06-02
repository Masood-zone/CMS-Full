import { apiClient } from "../../root"
import type { Class } from "../types" // Assuming Class type is declared in a separate file

/**
 * Fetch all classes.
 */
export const fetchClasses = async () => {
  try {
    const response = await apiClient.get("/classes")
    return response.data
  } catch (error) {
    console.error("Error fetching classes:", error)
    throw error
  }
}

/**
 * Update class
 */
export const updateClass = async (data: Class) => {
  try {
    const response = await apiClient.put(`/classes/${data.id}`, data)
    return response.data
  } catch (error) {
    console.error("Error updating class:", error)
    throw error
  }
}

/**
 * Create a new class.
 * @param data - Class creation data.
 */
export const createClass = async (data: {
  name: string
  description: string
  supervisorId: number
}) => {
  try {
    const response = await apiClient.post("/classes", data)
    return response.data
  } catch (error) {
    console.error("Error creating class:", error)
    throw error
  }
}

/**
 * Fetch class by id.
 */
export const fetchClass = async (id: number) => {
  try {
    const response = await apiClient.get(`/classes/${id}`)
    return response.data
  } catch (error) {
    console.error("Error fetching class:", error)
    throw error
  }
}
