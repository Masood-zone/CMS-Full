import { apiClient } from "../../root";
import type {
  Teacher,
  CreateTeacherPayload,
  UpdateTeacherPayload,
} from "./teachers.types";

// Fetch all teachers
export const fetchTeachers = async () => {
  const response = await apiClient.get<Teacher[]>("/users");
  return response.data;
};

// Fetch teacher by id
export const fetchTeacher = async (id: number) => {
  const response = await apiClient.get<{ teacher: Teacher }>(`/users/${id}`);
  return response.data;
};

// Create teacher
export const createTeacher = async (data: CreateTeacherPayload) => {
  // Backend expects teacher creation at /auth/signup
  const response = await apiClient.post<Teacher>("/auth/signup", data);
  return response.data;
};

// Update teacher
export const updateTeacher = async (data: UpdateTeacherPayload) => {
  const response = await apiClient.patch<Teacher>(`/users/${data.id}`, data);
  return response.data;
};

// Delete teacher
export const deleteTeacher = async (id: number) => {
  const response = await apiClient.delete(`/users/${id}`);
  return response.data;
};
