import { Injectable } from '@angular/core';
import { BudgetDataService } from '@services/budget/budget-data.service';
import { PlannedBudgetService } from '@services/budget/planned-budget.service';
import { CategoryService } from '@services/category/category.service';
import { ExpensesIncomeSummary, CategoryBudget, IncomeBudget } from '@models/budget.model';

@Injectable({
  providedIn: 'root',
})
export class ExpensesIncomeService {
  constructor(
    private budgetDataService: BudgetDataService,
    private plannedBudgetService: PlannedBudgetService,
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
        const categoryFromService = this.categoryService.getCategoryByName(expense.category, 'expense');
        expensesByCategory[expense.category] = { 
          amount: 0, 
          color: expense.categoryColor || categoryFromService?.color || '#95A5A6'
        };
      }
      expensesByCategory[expense.category].amount += expense.amount;
    });

    // Get planned budgets for this month
    const plannedExpenseBudgets = budgetData 
      ? this.plannedBudgetService.getPlannedBudgets('expense', budgetData.month, budgetData.year)
      : [];

    // Combine all categories (from actual expenses and planned budgets)
    const allCategories = new Set([
      ...plannedExpenseBudgets.map(b => b.category),
      ...Object.keys(expensesByCategory)
    ]);

    const expenseCategories: CategoryBudget[] = Array.from(allCategories).map(category => {
      const planned = budgetData 
        ? this.plannedBudgetService.getPlannedBudget(category, 'expense', budgetData.month, budgetData.year)
        : 0;
      
      return {
        category,
        planned,
        actual: expensesByCategory[category]?.amount || 0,
        color: expensesByCategory[category]?.color || this.categoryService.getCategoryByName(category, 'expense')?.color || '#95A5A6'
      };
    });

    const totalExpensesPlanned = expenseCategories.reduce((sum, cat) => sum + cat.planned, 0);
    const totalExpensesActual = expenseCategories.reduce((sum, cat) => sum + cat.actual, 0);

    // Process income transactions - income comes from transactions only
    const incomeBySource: { [key: string]: number } = {};

    // Calculate actual income from transactions
    monthlyTransactions.filter(t => t.type === 'income').forEach(transaction => {
      incomeBySource[transaction.category] = (incomeBySource[transaction.category] || 0) + transaction.amount;
    });

    // Get planned income budgets for this month
    const plannedIncomeBudgets = budgetData 
      ? this.plannedBudgetService.getPlannedBudgets('income', budgetData.month, budgetData.year)
      : [];

    // Combine all income sources (from actual income and planned budgets)
    const allIncomeSources = new Set([
      ...plannedIncomeBudgets.map(b => b.category),
      ...Object.keys(incomeBySource)
    ]);

    const incomeSources: IncomeBudget[] = Array.from(allIncomeSources).map(source => {
      const planned = budgetData 
        ? this.plannedBudgetService.getPlannedBudget(source, 'income', budgetData.month, budgetData.year)
        : 0;
      
      return {
        source,
        planned,
        actual: incomeBySource[source] || 0
      };
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

