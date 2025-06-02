import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import * as studentsApi from "./students.api";

/**
 * Query: Fetch all students.
 */
export const useFetchStudents = () => {
  return useQuery(["students"], studentsApi.fetchStudents, {
    onError: (error) => {
      console.error(error);
      toast.error("Failed to fetch students.");
    },
  });
};

/**
 * Query: Fetch all students of a class.
 */
export const useFetchStudentsByClass = (id: number) => {
  return useQuery(
    ["students", id],
    () => studentsApi.fetchStudentsInClass(id),
    {
      onError: (error) => {
        console.error(error);
        toast.error("Failed to fetch students in this class.");
      },
    }
  );
};

/**
 * Query: Fetch a student.
 */
export const useFetchStudent = (id: number) => {
  return useQuery(["student", id], () => studentsApi.fetchStudent(id), {
    onError: (error) => {
      console.log(error);
      toast.error("Failed to fetch student.");
    },
  });
};

/**
 * Mutation: Create a new student.
 */
export const useCreateStudent = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation((data: Student) => studentsApi.createStudent(data), {
    onSuccess: () => {
      toast.success("Student created successfully!");
      //Navigate to the students page after creating a student
      navigate(-1); //Temporal fix
      // Invalidate the query to refresh the table
      queryClient.invalidateQueries(["students"]);
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to create student. Please try again.");
    },
  });
};

/**
 * Mutation: Update a student.
 */
export const useUpdateStudent = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation((data: Student) => studentsApi.updateStudent(data), {
    onSuccess: () => {
      toast.success("Student updated successfully!");
      // Invalidate the query to refresh the table
      queryClient.invalidateQueries(["students"]);
      //Navigate to the students page after updating a student
      navigate(-1); //Temporal fix
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to update student. Please try again.");
    },
  });
};
