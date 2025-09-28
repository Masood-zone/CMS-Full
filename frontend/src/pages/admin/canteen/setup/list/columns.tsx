import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

export const columns = (
  handleUpdateStatus: (
    record: CanteenRecord,
    update: {
      hasPaid: boolean;
      isAbsent: boolean;
    }
  ) => void,
  updatingLoader: boolean
): ColumnDef<CanteenRecord>[] => [
  {
    accessorKey: "student.name",
    header: "Student Name",
    cell: ({ row }) =>
      row.original.student
        ? `${row.original.student.firstName} ${row.original.student.lastName}`
        : "N/A",
  },
  {
    accessorKey: "settingsAmount",
    header: "Amount",
    cell: ({ row }) => `₵${row.original.settingsAmount}`,
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) =>
      row?.original?.createdAt
        ? format(new Date(row.original.createdAt), "PPp")
        : "",
  },
  {
    accessorKey: "hasPaid",
    header: "Payment Status",
    cell: ({ row }) => (row.original.hasPaid ? "Paid" : "Unpaid"),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const record = row.original;
      return (
        <div className="flex space-x-2">
          <Button
            variant={record.hasPaid ? "destructive" : "default"}
            onClick={() =>
              handleUpdateStatus(record, {
                hasPaid: !record.hasPaid,
                isAbsent: false,
              })
            }
            disabled={updatingLoader}
          >
            {record.hasPaid ? "Mark as Unpaid" : "Mark as Paid"}
          </Button>
          {!record.hasPaid && !record.isAbsent && (
            <Button
              variant="outline"
              onClick={() =>
                handleUpdateStatus(record, { hasPaid: false, isAbsent: true })
              }
              disabled={updatingLoader}
            >
              Mark as Absent
            </Button>
          )}
          {record.isAbsent && (
            <Button
              variant="outline"
              onClick={() =>
                handleUpdateStatus(record, {
                  hasPaid: false,
                  isAbsent: false,
                })
              }
              disabled={updatingLoader}
            >
              Mark as Present
            </Button>
          )}
        </div>
      );
    },
  },
];
