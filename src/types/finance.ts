
export interface Expense {
  id: string;
  amount: number;
  category: 'Food' | 'Transport' | 'Entertainment' | 'Shopping' | 'Health' | 'Other';
  description?: string;
  date: string;
}

export interface SavingsGoalData {
  amount: number;
  month: string; // YYYY-MM format
}

export interface CategoryData {
  category: string;
  amount: number;
  color: string;
}
