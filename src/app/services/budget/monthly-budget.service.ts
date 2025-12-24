import { Injectable } from '@angular/core';
import { BudgetDataService } from './budget-data.service';
import { MonthlyBudgetSummary } from '@models/budget.model';

@Injectable({
  providedIn: 'root',
})
export class MonthlyBudgetService {
  constructor(private budgetDataService: BudgetDataService) {}

  calculateMonthlySummary(): MonthlyBudgetSummary {
    const budgetData = this.budgetDataService.getBudgetData();
    if (!budgetData) {
      return {
        startingBalance: 0,
        endBalance: 0,
        spentAmount: 0,
        savingsPercentage: 0,
        totalSaved: 0
      };
    }

    // Calculate starting balance from income transactions only
    const monthlyIncomeTransactions = this.budgetDataService.getMonthlyTransactions(budgetData.month, budgetData.year, 'income');
    const startingBalance = monthlyIncomeTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
    
    // Calculate total spent from both legacy expenses and new expense transactions
    const monthlyExpenses = this.budgetDataService.getMonthlyExpenses(budgetData.month, budgetData.year);
    const monthlyExpenseTransactions = this.budgetDataService.getMonthlyTransactions(budgetData.month, budgetData.year, 'expense');
    
    const spentFromExpenses = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const spentFromTransactions = monthlyExpenseTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
    const spentAmount = spentFromExpenses + spentFromTransactions;
    
    // End balance = starting balance (total income) - spent amount
    const endBalance = startingBalance - spentAmount;
    
    // Total saved = end balance (money we still have)
    const totalSaved = endBalance;
    
    // Savings percentage = percentage of starting balance that we didn't spend
    const savingsPercentage = startingBalance > 0 ? Math.round((totalSaved / startingBalance) * 100) : 0;

    return {
      startingBalance,
      endBalance,
      spentAmount,
      savingsPercentage,
      totalSaved
    };
  }
}

