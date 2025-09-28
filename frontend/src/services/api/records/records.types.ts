// Record types for API and queries
export interface StudentRecord {
  id: number;
  studentId?: number;
  classId: number;
  amount: number;
  date: string;
  hasPaid: boolean;
  isAbsent: boolean;
  paymentType: string;
  settingsAmount?: number;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
  payedBy: number | null;
  isPrepaid?: boolean;
  submitedBy?: number;
  student?: {
    id: number;
    firstName?: string;
    lastName?: string;
    name?: string | null;
    email?: string;
    phone?: string;
    classId?: number;
    parentName?: string;
    parentPhone?: string;
    parentEmail?: string;
    address?: string;
    dateOfBirth?: string;
    gender?: string;
    isActive?: boolean;
    age?: number;
    createdAt?: string;
    updatedAt?: string;
  };
  class?: {
    id: number;
    name: string;
    description?: string;
    supervisorId?: number;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
  };
  submitter?: {
    id: number;
    name: string;
    email?: string;
  };
}

export interface SubmitTeacherRecordPayload {
  classId: number;
  date: string;
  records: Array<{
    studentId: number;
    hasPaid: boolean;
    isAbsent: boolean;
    amount: number;
    notes?: string;
  }>;
}
