import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import * as analyticsApi from "./analytics.api";

/**
 * Query: Admin's Analytics
 */
export const useAdminDashboardAnalytics = () => {
  return useQuery(["adminAnalytics"], analyticsApi.fetchAdminAnalytics, {
    onError: (error) => {
      console.error(error);
      toast.error("Failed to fetch admin analytics.");
    },
  });
};

/**
 * Query: Teacher's Analytics
 */
export const useTeacherDashboardAnalytics = (classId: number) => {
  return useQuery(
    ["teacherAnalytics", classId],
    () => analyticsApi.fetchTeacherAnalytics(classId),
    {
      enabled: !!classId,
      onError: (error) => {
        console.error(error);
        toast.error("Failed to fetch teacher analytics.");
      },
    }
  );
};
