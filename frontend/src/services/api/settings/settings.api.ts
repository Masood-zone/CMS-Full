import { apiClient } from "../../root";

/**
 * Fetch canteen amount.
 */
export const fetchRecordsAmount = async () => {
  try {
    const response = await apiClient.get("/settings/canteen/amount");
    return response.data;
  } catch (error) {
    console.error("Error fetching records amount:", error);
    throw error;
  }
};

/**
 * Get preset amount.
 */
export const getPresetAmount = async () => {
  try {
    const response = await apiClient.get("/preset-amount");
    return response.data;
  } catch (error) {
    console.error("Error fetching preset amount:", error);
    throw error;
  }
};

/**
 * Create settings amount.
 */
export const createCanteenAmount = async (data: RecordsAmount) => {
  try {
    const response = await apiClient.post("/settings/canteen/amount", data);
    return response.data;
  } catch (error) {
    console.error("Error creating preset amount:", error);
    throw error;
  }
};

/**
 * Update settings amount.
 */
export const updateRecordsAmount = async (data: RecordsAmount) => {
  try {
    const response = await apiClient.put("/settings/canteen/amount", data);
    return response.data;
  } catch (error) {
    console.error("Error updating preset amount:", error);
    throw error;
  }
};
