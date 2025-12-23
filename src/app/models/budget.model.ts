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

export interface CategoryBudget {
  category: string;
  planned: number;
  actual: number;
  color?: string;
  expanded?: boolean;
}

export interface IncomeBudget {
  source: string;
  planned: number;
  actual: number;
  expanded?: boolean;
}

export interface ExpensesIncomeSummary {
  expenses: {
    categories: CategoryBudget[];
    totalPlanned: number;
    totalActual: number;
    difference: number;
  };
  income: {
    sources: IncomeBudget[];
    totalPlanned: number;
    totalActual: number;
    difference: number;
  };
}
