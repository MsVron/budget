import { Injectable } from '@angular/core';
import { BudgetDataService } from '@services/budget-data';
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

    const startingBalance = budgetData.savings + budgetData.paycheck + budgetData.bonus;
    const monthlyExpenses = this.budgetDataService.getMonthlyExpenses(budgetData.month, budgetData.year);
    const spentAmount = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const endBalance = startingBalance - spentAmount;
    const totalSaved = startingBalance - endBalance;
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

