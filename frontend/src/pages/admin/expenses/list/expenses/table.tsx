import { useFetchExpenses } from "@/services/api/expenses/expenses.queries";
import { useFetchOverallRecords } from "@/services/api/records/records.queries";

import { expensesColumn } from "./columns";
import { TableSkeleton } from "@/components/shared/page-loader/loaders";
import { ExpensesDataTable } from "@/components/tables/expenses-table";
import { useEffect, useMemo } from "react";
import { useDeleteResource } from "@/services/api";

export default function ExpensesTable() {
  const { data: expenses, isLoading, error } = useFetchExpenses();
  const { data: overall, error: recordsError } = useFetchOverallRecords();

  useEffect(() => {
    if (recordsError) {
      console.log("Error fetching records");
    }
  }, [recordsError]);

  const calculateExpensesTotal = useMemo(() => {
    return expenses?.reduce(
      (sum: number, expense: Expense) => sum + expense.amount,
      0
    );
  }, [expenses]);

  const { mutateAsync: deleteExpense } = useDeleteResource(
    "expenses",
    "expenses"
  );

  if (isLoading) return <TableSkeleton />;
  if (error) return <div>Error fetching expenses</div>;

  return (
    <>
      <ExpensesDataTable
        data={expenses || []}
        columns={expensesColumn(deleteExpense)}
        searchField="description"
        calculateTotal={calculateExpensesTotal}
        overallTotal={overall}
      />
    </>
  );
}
