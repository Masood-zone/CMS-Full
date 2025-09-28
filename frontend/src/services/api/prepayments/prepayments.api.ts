import { apiClient } from "../../root";

/**
 * Mutation: Create Prepayments
 */
export const createPrepayment = async (data: CreatePrepayment) => {
  try {
    const response = await apiClient.post("/prepayments", data);
    return response.data;
  } catch (error) {
    console.error("Error creating prepayment:", error);
    throw error;
  }
};

/**
 * Query: Fetch prepayments
 */
export const fetchPrepayments = async () => {
  try {
    const response = await apiClient.get("/prepayments");
    return response.data;
  } catch (error) {
    console.error("Error fetching prepayments:", error);
    throw error;
  }
};

/**
 * Query: Fetch a class prepayment
 */
export const fetchPrepaymentsByClass = async (classId: number) => {
  try {
    const response = await apiClient.get(`/prepayments/class/${classId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching prepayments:", error);
    throw error;
  }
};

/**
 * Mutation: Update a prepayment
 */
export const updatePrepayment = async (id: number, data: UpdatePrepayment) => {
  try {
    const response = await apiClient.put(`/prepayments/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating prepayment:", error);
    throw error;
  }
};
