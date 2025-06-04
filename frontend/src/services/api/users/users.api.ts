import { apiClient } from "../../root";

/**
 * Update User
 */
export const updateUser = async (data: FormUser) => {
  try {
    const response = await apiClient.patch(`/users/${data.id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

/**
 * Fetch all supervisors.
 */
export const fetchSupervisors = async () => {
  try {
    const response = await apiClient.get("/users");
    // Filter Teachers and their classes array should be empty
    const supervisors = response.data.filter(
      (user: {
        role: string;
        classes: {
          id: number;
          name: string;
          supervisorId: number | null;
        }[];
      }) => user.role === "TEACHER" && user.classes.length === 0
    );
    return supervisors;
  } catch (error) {
    console.error("Error fetching supervisors:", error);
    throw error;
  }
};

/**
 * Fetch supervisor
 */
export const fetchSupervisor = async (id: number) => {
  try {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching teacher:", error);
    throw error;
  }
};
