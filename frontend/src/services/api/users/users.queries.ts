import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import * as usersApi from "./users.api";

/**
 * Query: Fetch all supervisors.
 */
export const useFetchSupervisors = () => {
  return useQuery(["supervisors"], usersApi.fetchSupervisors, {
    onError: (error) => {
      console.error(error);
      toast.error("Failed to fetch supervisors.");
    },
  });
};

/**
 * Query: Fetch teacher
 */
export const useFetchSupervisor = (id: number) => {
  return useQuery(["teachers", id], () => usersApi.fetchSupervisor(id), {
    onError: (error) => {
      console.error(error);
      toast.error("Failed to fetch teacher.");
    },
  });
};

/**
 * Mutation: Update a user by calling upon updateUser function
 */
export const useUpdateUser = () => {
  return useMutation((data: FormUser) => usersApi.updateUser(data), {
    onSuccess: () => {
      toast.success("User updated successfully!");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to update user. Please try again.");
    },
    onSettled: (data) => {
      // Update the user in localStorage after updating
      const existingUser = JSON.parse(localStorage.getItem("user") || "{}");
      const updatedUser = {
        ...existingUser,
        user: {
          ...existingUser.user,
          email: data?.data.email,
          gender: data?.data.gender,
          name: data?.data.name,
          phone: data?.data.phone,
        },
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
    },
  });
};
