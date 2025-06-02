import ButtonLoader from "@/components/shared/button-loader/button-loader";
import GoBackButton from "@/components/shared/go-back/go-back";
import { PageHeading } from "@/components/typography/heading";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateStudent } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";

export default function AddStudent() {
  const { user } = useAuthStore();
  const { mutate: createStudent, isLoading } = useCreateStudent();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<Student>();
  const gender = watch("gender");
  const teacherClass = user?.classes?.[0];
  const onSubmit = async (data: Student) => {
    try {
      await createStudent({
        ...data,
        classId: teacherClass?.id.toString(),
        dateOfBirth: data.dateOfBirth
          ? new Date(data.dateOfBirth).toISOString()
          : undefined,
        isActive: data.isActive ?? true,
      });
    } catch (error) {
      console.error("Error creating student:", error);
    }
  };

  return (
    <section className="w-full">
      <Card className="w-full bg-transparent border-none shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <PageHeading>Register Student</PageHeading>
            <GoBackButton />
          </CardTitle>
          <CardDescription>
            <p>Register a student for {`${teacherClass?.name}`}</p>
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {/* First Name */}
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                {...register("firstName", { required: true })}
                autoComplete="off"
                placeholder="Student's first name"
                className="bg-transparent"
                required
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm">This field is required</p>
              )}
            </div>
            {/* Last Name */}
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                {...register("lastName", { required: true })}
                autoComplete="off"
                placeholder="Student's last name"
                className="bg-transparent"
                required
              />
              {errors.lastName && (
                <p className="text-red-500 text-sm">This field is required</p>
              )}
            </div>
            {/* Age */}
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                {...register("age", {
                  valueAsNumber: true,
                  min: 1,
                  max: 120,
                })}
                autoComplete="off"
                placeholder="Student's age"
                className="bg-transparent"
              />
              {errors.age && (
                <p className="text-red-500 text-sm">
                  {errors.age.message || "Age must be between 1 and 120"}
                </p>
              )}
            </div>
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                autoComplete="off"
                placeholder="Student's email (optional)"
                className="bg-transparent"
              />
            </div>
            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                {...register("phone")}
                autoComplete="off"
                placeholder="Student's phone (optional)"
                className="bg-transparent"
              />
            </div>
            {/* Gender */}
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={gender}
                onValueChange={(value) =>
                  setValue("gender", value as any, { shouldValidate: true })
                }
              >
                <SelectTrigger className="bg-transparent">
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && (
                <p className="text-red-500 text-sm">This field is required</p>
              )}
            </div>
            {/* Parent Name */}
            <div className="space-y-2">
              <Label htmlFor="parentName">Parent Name</Label>
              <Input
                id="parentName"
                {...register("parentName", { required: true })}
                autoComplete="off"
                placeholder="Parent's name"
                className="bg-transparent"
                required
              />
              {errors.parentName && (
                <p className="text-red-500 text-sm">This field is required</p>
              )}
            </div>
            {/* Parent Phone */}
            <div className="space-y-2">
              <Label htmlFor="parentPhone">Parent Phone</Label>
              <Input
                id="parentPhone"
                type="tel"
                {...register("parentPhone", { required: true })}
                autoComplete="off"
                placeholder="Parent's phone"
                className="bg-transparent"
                required
              />
              {errors.parentPhone && (
                <p className="text-red-500 text-sm">This field is required</p>
              )}
            </div>
            {/* Parent Email */}
            <div className="space-y-2">
              <Label htmlFor="parentEmail">Parent Email</Label>
              <Input
                id="parentEmail"
                type="email"
                {...register("parentEmail")}
                autoComplete="off"
                placeholder="Parent's email (optional)"
                className="bg-transparent"
              />
            </div>
            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                {...register("address")}
                autoComplete="off"
                placeholder="Home address (optional)"
                className="bg-transparent"
              />
            </div>
            {/* Date of Birth */}
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                {...register("dateOfBirth")}
                className="bg-transparent"
              />
            </div>
            {/* Is Active */}
            <div className="flex items-center space-x-2">
              <input
                id="isActive"
                type="checkbox"
                {...register("isActive")}
                defaultChecked
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
            {/* Hidden classId */}
            <input
              type="hidden"
              value={teacherClass?.id}
              {...register("classId")}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              <ButtonLoader
                isPending={isLoading}
                loadingText="Registering..."
                fallback="Register"
              />
            </Button>
            <div className="space-x-4 text-center text-gray-500">
              <Link to="/contact-us" className="text-sm hover:text-primary">
                Facing issues? Contact us
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </section>
  );
}
