// Expense types for API and queries
export interface Reference {
  id: number;
  name: string;
  description?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Expense {
  id?: number;
  amount: number;
  date: string;
  description?: string;
  references?: Reference | { id: number };
  reference?: Reference; // for fetched data
  submittedBy?: number;
  submitedBy?: number;
  createdAt?: string;
  updatedAt?: string;
}
