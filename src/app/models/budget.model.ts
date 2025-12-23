 export interface BudgetData {
  savings: number;
  paycheck: number;
  bonus: number;
  month: string;
  year: number;
}

export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: Date;
}

export interface MonthlyBudgetSummary {
  startingBalance: number;
  endBalance: number;
  spentAmount: number;
  savingsPercentage: number;
  totalSaved: number;
}

