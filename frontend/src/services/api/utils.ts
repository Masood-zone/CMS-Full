import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "../root";

/**
 * Delete a resource and handle errors.
 * @param resource - API endpoint for the resource (e.g., "users","students","classes").
 */
export const useDeleteResource = (resource: string, queryKey: string) => {
  const queryClient = useQueryClient();

  return useMutation(
    (id: string | number) => apiClient.delete(`/${resource}/${id}`),
    {
      onMutate: (id) => {
        toast(`Deleting ${resource} with ID ${id}...`);
      },
      onSuccess: () => {
        // Invalidate the query to refresh the table
        queryClient.invalidateQueries([queryKey]);
        toast.success(`${resource} deleted successfully!`);
      },
      onError: (error, id) => {
        console.error(error);
        toast.error(`Failed to delete ${resource} with ID ${id}.`);
      },
    }
  );
};
