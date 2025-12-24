import { Injectable } from '@angular/core';
import { BudgetDataService } from '@services/budget-data';
import { ExpensesIncomeSummary, CategoryBudget, IncomeBudget } from '@models/budget.model';

@Injectable({
  providedIn: 'root',
})
export class ExpensesIncomeService {
  private readonly categoryBudgets: { [key: string]: { planned: number; color?: string } } = {
    'Food': { planned: 266.50, color: '#FF6B35' },
    'Transportation': { planned: 350.00, color: '#2C3E50' },
    'Self-Care': { planned: 330.00, color: '#FF3B30' },
    'Hygiene': { planned: 88.00, color: '#4CAF50' },
    'Phone': { planned: 49.00, color: '#2C3E50' }
  };

  private readonly incomeBudgets: { [key: string]: number } = {
    'Savings': 458.00,
    'Paycheck': 700.00,
    'Bonus': 0.00
  };

  constructor(private budgetDataService: BudgetDataService) {}

  getExpensesIncomeSummary(): ExpensesIncomeSummary {
    const budgetData = this.budgetDataService.getBudgetData();

    const monthlyExpenses = budgetData 
      ? this.budgetDataService.getMonthlyExpenses(budgetData.month, budgetData.year)
      : [];

    const expensesByCategory: { [key: string]: number } = {};
    monthlyExpenses.forEach(expense => {
      expensesByCategory[expense.category] = (expensesByCategory[expense.category] || 0) + expense.amount;
    });

    const expenseCategories: CategoryBudget[] = Object.keys(this.categoryBudgets).map(category => ({
      category,
      planned: this.categoryBudgets[category].planned,
      actual: expensesByCategory[category] || 0,
      color: this.categoryBudgets[category].color
    }));

    const totalExpensesPlanned = expenseCategories.reduce((sum, cat) => sum + cat.planned, 0);
    const totalExpensesActual = expenseCategories.reduce((sum, cat) => sum + cat.actual, 0);

    const incomeSources: IncomeBudget[] = [
      {
        source: 'Savings',
        planned: this.incomeBudgets['Savings'],
        actual: budgetData?.savings || 0
      },
      {
        source: 'Paycheck',
        planned: this.incomeBudgets['Paycheck'],
        actual: budgetData?.paycheck || 0
      },
      {
        source: 'Bonus',
        planned: this.incomeBudgets['Bonus'],
        actual: budgetData?.bonus || 0
      }
    ];

    const totalIncomePlanned = incomeSources.reduce((sum, src) => sum + src.planned, 0);
    const totalIncomeActual = incomeSources.reduce((sum, src) => sum + src.actual, 0);

    return {
      expenses: {
        categories: expenseCategories,
        totalPlanned: totalExpensesPlanned,
        totalActual: totalExpensesActual,
        difference: totalExpensesPlanned - totalExpensesActual
      },
      income: {
        sources: incomeSources,
        totalPlanned: totalIncomePlanned,
        totalActual: totalIncomeActual,
        difference: totalIncomeActual - totalIncomePlanned
      }
    };
  }
}

