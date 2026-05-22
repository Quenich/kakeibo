export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  category: string;
  amount: number;
  description: string;
  createdAt: string;
}

export interface Budget {
  category: string;
  amount: number;
}

export interface Asset {
  id: string;
  label: string;
  amount: number;
}

export interface RecurringTransaction {
  id: string;
  type: TransactionType;
  category: string;
  amount: number;
  description: string;
  frequency: 'weekly' | 'monthly';
  dayOfWeek: number;  // 0=Sun…6=Sat  (weekly only)
  dayOfMonth: number; // 1-31          (monthly only)
  startDate: string;  // YYYY-MM-DD
  lastApplied: string | null;
  active: boolean;
}
