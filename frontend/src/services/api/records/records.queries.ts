import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "../../root";
import * as recordsApi from "./records.api";

interface RecordsApiResponse {
  success: boolean;
  message: string;
  data: StudentRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

type Overall = number;

/**
 * Query: Fetch all records.
 */
export const useFetchRecords = (page = 1, limit = 100) => {
  return useQuery<StudentRecord[], Error>(
    ["records", page, limit],
    async () => {
      const response: RecordsApiResponse = await recordsApi.fetchRecords(
        page,
        limit
      );
      return response.data;
    },
    {
      onError: (error) => {
        console.error(error);
        toast.error("Failed to fetch records.");
      },
    }
  );
};
/**
 * Query: Fetch overall records.
 */
export const useFetchOverallRecords = () => {
  return useQuery<Overall, Error>(
    ["overallRecords"],
    () => recordsApi.fetchOverallRecords(),
    {
      onError: (error) => {
        console.error(error);
        toast.error("Failed to fetch overall records.");
      },
    }
  );
};

/**
 * Query: Fetch all unpaid students.
 */
export const useFetchUnpaidStudents = (date: string) => {
  return useQuery(["unpaidStudents", date], async () => {
    const response = await apiClient.get(`/records/unpaid?date=${date}`);
    return response.data;
  });
};

/**
 * Query: Fetch all records of a class by date.
 */
export const useFetchRecordsByClassAndDate = (
  classId: number,
  date: string
) => {
  return useQuery(
    ["records", classId, date],
    () => recordsApi.fetchRecordsByClassAndDate(classId, date),
    {
      onError: (error) => {
        console.error(error);
        toast.error("Failed to fetch records.");
      },
    }
  );
};

/**
 * Query: Get all records of students by class and date.
 */
export const useStudentRecordsByClassAndDate = (
  classId: number,
  date: string
) => {
  return useQuery(
    ["studentRecords", classId, date],
    () => recordsApi.getStudentRecordsByClassAndDate(classId, date),
    {
      enabled: !!classId && !!date,
      onError: (error) => {
        console.error(error);
        toast.error("Failed to fetch student records.");
      },
    }
  );
};

/**
 * Query: Fetch a record detail
 */
export const useFetchRecordsDetail = (id: number) => {
  const queryClient = useQueryClient();
  return useQuery(
    ["recordDetails", id],
    () => recordsApi.fetchRecordDetails(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["records"]);
      },
      onError: (error) => {
        console.error(error);
        toast.error("Failed to fetch record details.");
      },
    }
  );
};

/**
 * Query: Fetch all submitted records of a user by date.
 */
export const useFetchSubmittedRecords = (date: string) => {
  return useQuery<[], Error>(
    ["submittedRecords", date],
    async () => {
      const response = await apiClient.get(`/records/submitted?date=${date}`);
      return response?.data;
    },
    {
      enabled: !!date,
      onError: (error) => {
        console.error("Error fetching submitted records:", error);
        // Handle error (e.g., show a toast notification)
      },
    }
  );
};

/**
 * Mutation: Generate student records.
 */
export const useGenerateStudentRecords = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (data: { classId: number; date: string; adminId: number }) =>
      recordsApi.generateRecordForADate(data.classId, data.date, data.adminId),
    {
      onSuccess: () => {
        toast.success(`Records generated successfully!`);
        queryClient.invalidateQueries(["studentRecords"]);
      },
      onError: (error) => {
        console.error(error);
        toast.error("Failed to generate records.");
      },
    }
  );
};

/**
 * Mutation: Update a student status.
 */
export const useUpdateStudentStatus = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (data: StudentRecord) => recordsApi.updateStudentStatus(data),
    {
      onSuccess: () => {
        toast.success("Record submitted successfully!");
        queryClient.invalidateQueries(["studentRecords"]);
        queryClient.invalidateQueries(["teacherRecords"]);
      },
      onError: (error) => {
        console.error(error);
        toast.error("Failed to submit record.");
      },
    }
  );
};

/**
 * Mutation for submitting teacher records
 */
export const useSubmitAdminRecord = () => {
  const queryClient = useQueryClient();
  return useMutation(recordsApi.submitTeacherRecord, {
    onSuccess: () => {
      queryClient.invalidateQueries(["studentRecords"]);
      queryClient.invalidateQueries(["teacherRecords"]);
      toast.success("Records submitted successfully.");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to submit records.");
    },
  });
};
