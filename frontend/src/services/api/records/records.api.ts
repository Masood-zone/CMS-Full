import { apiClient } from "../../root"
import type { SubmitTeacherRecordPayload, StudentRecord } from "./records.types" // Assuming these types are declared in records.types.ts

/**
 * Fetch all records.
 */
export const fetchRecords = async () => {
  try {
    const response = await apiClient.get("/records")
    return response.data
  } catch (error) {
    console.error("Error fetching records:", error)
    throw error
  }
}

/**
 * Fetch all records of a class by date.
 */
export const fetchRecordsByClassAndDate = async (classId: number, date: string) => {
  try {
    const response = await apiClient.get(`/records/${classId}?date=${date}`)
    return response.data
  } catch (error) {
    console.error("Error fetching records:", error)
    throw error
  }
}

/**
 * Query: Get students records by class and date
 */
export const getStudentRecordsByClassAndDate = async (classId: number, date: string) => {
  try {
    const response = await apiClient.get(`/records/${classId}?date=${date}`)
    return response.data
  } catch (error) {
    console.error("Error fetching student records:", error)
    throw error
  }
}

/**
 * Query: Get record details by id
 */
export const fetchRecordDetails = async (id: number) => {
  try {
    const response = await apiClient.get(`/records/details?id=${id}`)
    return response.data
  } catch (error) {
    console.error("Error fetching record details:", error)
    throw error
  }
}

/**
 * Mutation: Generate records for students based on classID and date
 */
export const generateRecordForADate = async (classId: number, date: string, id: number) => {
  try {
    const response = await apiClient.post(`/records/generate-daily?date=${date}&classId=${classId}&id=${id}`)
    return response.data
  } catch (error) {
    console.error("Error generating records:", error)
    throw error
  }
}

/**
 * Submit teacher record
 */
export const submitTeacherRecord = async (data: SubmitTeacherRecordPayload) => {
  try {
    const response = await apiClient.post("/records/submit", data)
    return response.data
  } catch (error) {
    console.error("Error submitting teacher record:", error)
    throw error
  }
}

/**
 * Update student status
 * PUT /records/:id/status
 * Body: {
 *   "hasPaid": true,
 *   "isAbsent": false
 * }
 */
export const updateStudentStatus = async (data: StudentRecord) => {
  try {
    const response = await apiClient.put(`/records/${data?.id}/status`, data)
    return response.data
  } catch (error) {
    console.error("Error updating student status:", error)
    throw error
  }
}
