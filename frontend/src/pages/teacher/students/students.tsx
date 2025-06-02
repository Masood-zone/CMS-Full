import { Header } from "@/components/typography/heading";
import { useNavigate } from "react-router-dom";
import StudentsTable from "./list/table";
import { useAuthStore } from "@/store/authStore";
import { useFetchStudentsByClass } from "@/services/api";

export default function Students() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    data: students,
    isLoading,
    error,
  } = useFetchStudentsByClass(user?.classes?.[0]?.id ?? 0);

  return (
    <section>
      {/* Header */}
      <Header
        title={`Students in ${user?.classes?.[0]?.name}`}
        buttonText="Add Student"
        buttonAction={() => navigate("/teacher/students/add")}
      />
      {/* Table */}
      <StudentsTable
        data={students || []}
        isLoading={isLoading}
        error={error}
      />
    </section>
  );
}
