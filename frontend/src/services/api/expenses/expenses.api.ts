import { apiClient } from "../../root"
import type { Expense, Reference } from "../types" // Assuming Expense and Reference types are declared in a separate file

/**
 * Fetch all expenses.
 */
export const fetchExpenses = async () => {
  try {
    const response = await apiClient.get("/expenses")
    return response.data
  } catch (error) {
    console.error("Error fetching expenses:", error)
    throw error
  }
}

/**
 * Create a new expense.
 */
export const createExpense = async (data: Expense) => {
  try {
    const response = await apiClient.post("/expenses", data)
    return response.data
  } catch (error) {
    console.error("Error creating expense:", error)
    throw error
  }
}

/**
 * Fetch expense by id.
 */
export const fetchExpense = async (id: number) => {
  try {
    const response = await apiClient.get(`/expenses/${id}`)
    return response.data
  } catch (error) {
    console.error("Error fetching expense:", error)
    throw error
  }
}

/**
 * Update an expense.
 */
export const updateExpense = async (data: Expense) => {
  try {
    const response = await apiClient.put(`/expenses/${data.id}`, data)
    return response.data
  } catch (error) {
    console.error("Error updating expense:", error)
    throw error
  }
}

/**
 * Fetch References
 */
export const fetchReferences = async () => {
  try {
    const response = await apiClient.get("/references")
    return response.data
  } catch (error) {
    console.error("Error fetching references:", error)
    throw error
  }
}

/**
 * Update References
 */
export const updateReference = async (data: Reference) => {
  try {
    const response = await apiClient.put(`/references/${data.id}`, data)
    return response.data
  } catch (error) {
    console.error("Error updating references:", error)
    throw error
  }
}

/**
 * Create a References
 */
export const createReference = async (data: Reference) => {
  try {
    const response = await apiClient.post("/references", data)
    return response.data
  } catch (error) {
    console.error("Error creating reference:", error)
    throw error
  }
}

/**
 * Fetch reference by id
 */
export const fetchReference = async (id: number) => {
  try {
    const response = await apiClient.get(`/references/${id}`)
    return response.data
  } catch (error) {
    console.error("Error fetching reference:", error)
    throw error
  }
}
