import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { StorageService } from '@services/storage';
import { BudgetData, Expense, MonthlyBudgetSummary } from '@models/budget.model';

@Injectable({
  providedIn: 'root',
})
export class BudgetService {
  private readonly BUDGET_KEY = 'budgetData';
  private readonly EXPENSES_KEY = 'expenses';

  private budgetDataSubject = new BehaviorSubject<BudgetData | null>(null);
  private expensesSubject = new BehaviorSubject<Expense[]>([]);

  budgetData$: Observable<BudgetData | null> = this.budgetDataSubject.asObservable();
  expenses$: Observable<Expense[]> = this.expensesSubject.asObservable();

  constructor(private storageService: StorageService) {
    this.loadBudgetData();
    this.loadExpenses();
  }

  private async loadBudgetData(): Promise<void> {
    const data = await this.storageService.get(this.BUDGET_KEY);
    if (data) {
      this.budgetDataSubject.next(data);
    } else {
      const defaultData: BudgetData = {
        savings: 1316.85,
        paycheck: 1099.15,
        bonus: 0,
        month: 'August',
        year: 2025
      };
      await this.saveBudgetData(defaultData);
    }
  }

  private async loadExpenses(): Promise<void> {
    const expenses = await this.storageService.get(this.EXPENSES_KEY);
    this.expensesSubject.next(expenses || []);
  }

  async saveBudgetData(data: BudgetData): Promise<void> {
    await this.storageService.set(this.BUDGET_KEY, data);
    this.budgetDataSubject.next(data);
  }

  async addExpense(expense: Expense): Promise<void> {
    const expenses = this.expensesSubject.value;
    expenses.push(expense);
    await this.storageService.set(this.EXPENSES_KEY, expenses);
    this.expensesSubject.next(expenses);
  }

  async updateExpense(updatedExpense: Expense): Promise<void> {
    const expenses = this.expensesSubject.value;
    const index = expenses.findIndex(e => e.id === updatedExpense.id);
    if (index !== -1) {
      expenses[index] = updatedExpense;
      await this.storageService.set(this.EXPENSES_KEY, expenses);
      this.expensesSubject.next(expenses);
    }
  }

  async deleteExpense(expenseId: string): Promise<void> {
    const expenses = this.expensesSubject.value.filter(e => e.id !== expenseId);
    await this.storageService.set(this.EXPENSES_KEY, expenses);
    this.expensesSubject.next(expenses);
  }

  getBudgetData(): BudgetData | null {
    return this.budgetDataSubject.value;
  }

  getExpenses(): Expense[] {
    return this.expensesSubject.value;
  }

  getMonthlyExpenses(month: string, year: number): Expense[] {
    return this.expensesSubject.value.filter(expense => {
      const expenseDate = new Date(expense.date);
      const expenseMonth = expenseDate.toLocaleString('en-US', { month: 'long' });
      return expenseMonth === month && expenseDate.getFullYear() === year;
    });
  }

  calculateMonthlySummary(): MonthlyBudgetSummary {
    const budgetData = this.budgetDataSubject.value;
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
    const monthlyExpenses = this.getMonthlyExpenses(budgetData.month, budgetData.year);
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
