import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import * as expensesApi from "./expenses.api";

/**
 * Query: Fetch all expenses.
 */
export const useFetchExpenses = () => {
  return useQuery(["expenses"], expensesApi.fetchExpenses, {
    onError: (error) => {
      console.error(error);
      toast.error("Failed to fetch expenses.");
    },
  });
};

/**
 * Query: Fetch all references.
 */
export const useFetchReferences = () => {
  return useQuery(["references"], expensesApi.fetchReferences, {
    onError: (error) => {
      console.error(error);
      toast.error("Failed to fetch references.");
    },
  });
};

/**
 * Query: Fetch reference by id.
 */
export const useFetchReference = (id: number) => {
  return useQuery(["references", id], () => expensesApi.fetchReference(id), {
    onError: (error) => {
      console.error(error);
      toast.error("Failed to fetch reference.");
    },
  });
};

/**
 * Fetch expense by id.
 */
export const useFetchExpense = (id: number) => {
  return useQuery(["expenses", id], () => expensesApi.fetchExpense(id), {
    onError: (error) => {
      console.error(error);
      toast.error("Failed to fetch expense.");
    },
  });
};

/**
 * Mutation: Create a new reference
 */
export const useCreateReference = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation((data: Reference) => expensesApi.createReference(data), {
    onSuccess: () => {
      queryClient.invalidateQueries(["references"]);
      toast.success("Reference created successfully!");
      navigate("/admin/expenses");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to create reference. Please try again.");
    },
  });
};

/**
 * Mutation: Update a reference
 */
export const useUpdateReference = () => {
  const queryClient = useQueryClient();

  return useMutation((data: Reference) => expensesApi.updateReference(data), {
    onSuccess: () => {
      queryClient.invalidateQueries(["references"]);
      toast.success("References updated successfully!");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to update reference. Please try again.");
    },
  });
};

/**
 * Mutation: Create a new expense.
 */
export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation((data: Expense) => expensesApi.createExpense(data), {
    onSuccess: () => {
      queryClient.invalidateQueries(["expenses"]);
      toast.success("Expense created successfully!");
      navigate("/admin/expenses");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to create expense. Please try again.");
    },
  });
};

/**
 * Mutation: Update an expense.
 */
export const useUpdateExpense = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation((data: Expense) => expensesApi.updateExpense(data), {
    onSuccess: () => {
      queryClient.invalidateQueries(["expenses"]);
      toast.success("Expense updated successfully!");
      navigate("/admin/expenses");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to update expense. Please try again.");
    },
  });
};
