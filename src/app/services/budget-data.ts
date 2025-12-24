import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { StorageService } from '@services/storage';
import { BudgetData, Expense } from '@models/budget.model';

@Injectable({
  providedIn: 'root',
})
export class BudgetDataService {
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
        savings: 916.00,
        paycheck: 1200.00,
        bonus: 300.00,
        month: 'August',
        year: 2025
      };
      await this.saveBudgetData(defaultData);
    }
  }

  private async loadExpenses(): Promise<void> {
    const expenses = await this.storageService.get(this.EXPENSES_KEY);
    if (expenses && expenses.length > 0) {
      this.expensesSubject.next(expenses);
    } else {
      const sampleExpenses: Expense[] = [
        { id: '1', amount: 147.15, category: 'Food', description: 'Groceries', date: new Date('2025-08-05') },
        { id: '2', amount: 160.00, category: 'Transportation', description: 'Gas and parking', date: new Date('2025-08-10') },
        { id: '3', amount: 519.00, category: 'Self-Care', description: 'Spa and wellness', date: new Date('2025-08-12') },
        { id: '4', amount: 0.00, category: 'Hygiene', description: 'Personal care', date: new Date('2025-08-15') },
        { id: '5', amount: 49.00, category: 'Phone', description: 'Mobile bill', date: new Date('2025-08-20') }
      ];
      await this.storageService.set(this.EXPENSES_KEY, sampleExpenses);
      this.expensesSubject.next(sampleExpenses);
    }
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
}

