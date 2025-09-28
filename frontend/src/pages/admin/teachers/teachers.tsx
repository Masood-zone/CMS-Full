import { Header } from "@/components/typography/heading";
import { useNavigate } from "react-router-dom";
import TeachersTable from "./list/table";
import { useFetchTeachers } from "@/services/api/teachers/teachers.queries";

export default function Teachers() {
  const navigate = useNavigate();
  const { data: teachers, isLoading, error } = useFetchTeachers();

  // Fix type: assigned_class should be undefined instead of null
  const normalizedTeachers = (teachers || []).map((t) => ({
    ...t,
    role: t.role ?? "",
    assigned_class: t.assigned_class ?? undefined,
  }));
  return (
    <section>
      {/* Header */}
      <Header
        title="Teachers"
        buttonText="Add Teacher"
        buttonAction={() => navigate("/admin/teachers/add")}
      />
      {/* Table */}
      <TeachersTable
        data={normalizedTeachers as Teacher[]}
        isLoading={isLoading}
        error={error}
      />
    </section>
  );
}
