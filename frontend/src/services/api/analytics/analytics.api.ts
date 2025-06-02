import { apiClient } from "../../root";

/**
 * Fetch admin analytics
 */
export const fetchAdminAnalytics = async () => {
  try {
    const response = await apiClient.get("/analytics/dashboard");
    return response.data;
  } catch (error) {
    console.error("Error fetching admin analytics:", error);
    throw error;
  }
};

/**
 * Fetch teacher analytics
 * @param classId - ID of the class to fetch analytics for
 */
export const fetchTeacherAnalytics = async (classId: number) => {
  try {
    const response = await apiClient.get(`/analytics/teacher/${classId}`);
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching teacher analytics for class ${classId}:`,
      error
    );
    throw error;
  }
};
