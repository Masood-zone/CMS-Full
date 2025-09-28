import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as teachersApi from "./teachers.api";

// Fetch all teachers
export const useFetchTeachers = () => {
  return useQuery(["teachers"], teachersApi.fetchTeachers, {
    onError: (error) => {
      console.error(error);
      toast.error("Failed to fetch teachers.");
    },
  });
};

// Fetch teacher by id
export const useFetchTeacher = (id: number) => {
  return useQuery(["teachers", id], () => teachersApi.fetchTeacher(id), {
    onError: (error) => {
      console.error(error);
      toast.error("Failed to fetch teacher.");
    },
  });
};

// Create teacher
export const useCreateTeacher = () => {
  const queryClient = useQueryClient();
  return useMutation(teachersApi.createTeacher, {
    onSuccess: () => {
      toast.success("Teacher created successfully!");
      queryClient.invalidateQueries(["teachers"]);
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to create teacher.");
    },
  });
};

// Update teacher
export const useUpdateTeacher = () => {
  const queryClient = useQueryClient();
  return useMutation(teachersApi.updateTeacher, {
    onSuccess: () => {
      toast.success("Teacher updated successfully!");
      queryClient.invalidateQueries(["teachers"]);
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to update teacher.");
    },
  });
};

// Delete teacher
export const useDeleteTeacher = () => {
  const queryClient = useQueryClient();
  return useMutation(teachersApi.deleteTeacher, {
    onSuccess: () => {
      toast.success("Teacher deleted successfully!");
      queryClient.invalidateQueries(["teachers"]);
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to delete teacher.");
    },
  });
};
