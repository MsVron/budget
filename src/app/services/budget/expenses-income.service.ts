import { Injectable } from '@angular/core';
import { BudgetDataService } from '@services/budget/budget-data.service';
import { CategoryService } from '@services/category/category.service';
import { ExpensesIncomeSummary, CategoryBudget, IncomeBudget } from '@models/budget.model';

@Injectable({
  providedIn: 'root',
})
export class ExpensesIncomeService {
  private readonly categoryBudgets: { [key: string]: { planned: number; color?: string } } = {};

  private readonly incomeBudgets: { [key: string]: number } = {};

  constructor(
    private budgetDataService: BudgetDataService,
    private categoryService: CategoryService
  ) {}

  getExpensesIncomeSummary(): ExpensesIncomeSummary {
    const budgetData = this.budgetDataService.getBudgetData();

    // Get transactions from new system
    const monthlyTransactions = budgetData 
      ? this.budgetDataService.getMonthlyTransactions(budgetData.month, budgetData.year)
      : [];

    // Get legacy expenses for backwards compatibility
    const monthlyExpenses = budgetData 
      ? this.budgetDataService.getMonthlyExpenses(budgetData.month, budgetData.year)
      : [];

    // Combine transactions and legacy expenses
    const expensesByCategory: { [key: string]: { amount: number; color: string } } = {};
    
    // Process new transactions
    monthlyTransactions.filter(t => t.type === 'expense').forEach(transaction => {
      if (!expensesByCategory[transaction.category]) {
        expensesByCategory[transaction.category] = { amount: 0, color: transaction.categoryColor };
      }
      expensesByCategory[transaction.category].amount += transaction.amount;
    });

    // Process legacy expenses
    monthlyExpenses.forEach(expense => {
      if (!expensesByCategory[expense.category]) {
        const categoryData = this.categoryBudgets[expense.category];
        const categoryFromService = this.categoryService.getCategoryByName(expense.category, 'expense');
        expensesByCategory[expense.category] = { 
          amount: 0, 
          color: expense.categoryColor || categoryFromService?.color || categoryData?.color || '#95A5A6'
        };
      }
      expensesByCategory[expense.category].amount += expense.amount;
    });

    // Get all unique categories from both planned budgets and actual expenses
    const allCategories = new Set([
      ...Object.keys(this.categoryBudgets),
      ...Object.keys(expensesByCategory)
    ]);

    const expenseCategories: CategoryBudget[] = Array.from(allCategories).map(category => ({
      category,
      planned: this.categoryBudgets[category]?.planned || 0,
      actual: expensesByCategory[category]?.amount || 0,
      color: expensesByCategory[category]?.color || this.categoryBudgets[category]?.color || '#95A5A6'
    }));

    const totalExpensesPlanned = expenseCategories.reduce((sum, cat) => sum + cat.planned, 0);
    const totalExpensesActual = expenseCategories.reduce((sum, cat) => sum + cat.actual, 0);

    // Process income transactions
    const incomeBySource: { [key: string]: number } = {
      'Savings': budgetData?.savings || 0,
      'Paycheck': budgetData?.paycheck || 0,
      'Bonus': budgetData?.bonus || 0
    };

    // Add income from transactions
    monthlyTransactions.filter(t => t.type === 'income').forEach(transaction => {
      incomeBySource[transaction.category] = (incomeBySource[transaction.category] || 0) + transaction.amount;
    });

    const incomeSources: IncomeBudget[] = Object.keys(this.incomeBudgets).map(source => ({
      source,
      planned: this.incomeBudgets[source],
      actual: incomeBySource[source] || 0
    }));

    // Add any additional income sources from transactions not in default budgets
    Object.keys(incomeBySource).forEach(source => {
      if (!this.incomeBudgets[source]) {
        incomeSources.push({
          source,
          planned: 0,
          actual: incomeBySource[source]
        });
      }
    });

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

