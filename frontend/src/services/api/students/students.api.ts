import { apiClient } from "../../root";

/**
 * Fetch all students.
 */
export const fetchStudents = async () => {
  try {
    const response = await apiClient.get("/students");
    return response.data;
  } catch (error) {
    console.error("Error fetching students:", error);
    throw error;
  }
};

/**
 * Fetch all students in a class.
 */
export const fetchStudentsInClass = async (id: number) => {
  try {
    const response = await apiClient.get(`/students/class/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching students in class:", error);
    throw error;
  }
};

/**
 * Fetch a student.
 */
export const fetchStudent = async (id: number) => {
  try {
    const response = await apiClient.get(`/students/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching student:", error);
    throw error;
  }
};

/**
 * Update a student.
 */
export const updateStudent = async (data: Student) => {
  try {
    const response = await apiClient.patch(`/students/update/${data.id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating student:", error);
    throw error;
  }
};

/**
 * Create a new student.
 * @param data - Student creation data.
 */
export const createStudent = async (data: Student) => {
  try {
    const response = await apiClient.post("/students/create", data);
    return response.data;
  } catch (error) {
    console.error("Error creating student:", error);
    throw error;
  }
};
