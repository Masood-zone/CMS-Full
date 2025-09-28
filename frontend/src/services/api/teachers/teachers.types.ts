// Teacher types for API and queries
export interface Teacher {
  id: number;
  name: string;
  email: string;
  phone: string;
  gender?: "MALE" | "FEMALE" | string;
  role: string;
  assigned_class?: {
    id: number;
    name: string;
  };
  classes?: Array<{ id: number; name: string }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTeacherPayload {
  name: string;
  email: string;
  phone: string;
  gender?: "MALE" | "FEMALE" | string;
  password?: string;
  role?: string;
  assigned_class?: {
    id: number;
    name: string;
  };
}

export interface UpdateTeacherPayload extends Partial<CreateTeacherPayload> {
  id: number;
}
