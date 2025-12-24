import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { StorageService } from '../core/storage.service';
import { BudgetData, Expense, Transaction } from '@models/budget.model';

@Injectable({
  providedIn: 'root',
})
export class BudgetDataService {
  private readonly BUDGET_KEY = 'budgetData';
  private readonly EXPENSES_KEY = 'expenses';
  private readonly TRANSACTIONS_KEY = 'transactions';

  private budgetDataSubject = new BehaviorSubject<BudgetData | null>(null);
  private expensesSubject = new BehaviorSubject<Expense[]>([]);
  private transactionsSubject = new BehaviorSubject<Transaction[]>([]);
  private selectedMonthYearSubject = new BehaviorSubject<{ month: string; year: number }>({
    month: new Date().toLocaleString('en-US', { month: 'long' }),
    year: new Date().getFullYear()
  });

  budgetData$: Observable<BudgetData | null> = this.budgetDataSubject.asObservable();
  expenses$: Observable<Expense[]> = this.expensesSubject.asObservable();
  transactions$: Observable<Transaction[]> = this.transactionsSubject.asObservable();
  selectedMonthYear$: Observable<{ month: string; year: number }> = this.selectedMonthYearSubject.asObservable();

  constructor(private storageService: StorageService) {
    this.loadBudgetData();
    this.loadExpenses();
    this.loadTransactions();
  }

  private async loadBudgetData(): Promise<void> {
    const data = await this.storageService.get(this.BUDGET_KEY);
    if (data) {
      this.budgetDataSubject.next(data);
    } else {
      // Initialize with current month/year
      const defaultData: BudgetData = {
        month: new Date().toLocaleString('en-US', { month: 'long' }),
        year: new Date().getFullYear()
      };
      await this.saveBudgetData(defaultData);
    }
  }

  private async loadExpenses(): Promise<void> {
    const expenses = await this.storageService.get(this.EXPENSES_KEY);
    if (expenses && expenses.length > 0) {
      this.expensesSubject.next(expenses);
    } else {
      // Start with empty expenses - user will add their own
      this.expensesSubject.next([]);
    }
  }

  private async loadTransactions(): Promise<void> {
    const transactions = await this.storageService.get(this.TRANSACTIONS_KEY);
    if (transactions && transactions.length > 0) {
      this.transactionsSubject.next(transactions);
    } else {
      this.transactionsSubject.next([]);
    }
  }

  async saveBudgetData(data: BudgetData): Promise<void> {
    await this.storageService.set(this.BUDGET_KEY, data);
    this.budgetDataSubject.next(data);
  }

  async addTransaction(transaction: Transaction): Promise<void> {
    const transactions = [...this.transactionsSubject.value];
    transactions.push(transaction);
    await this.storageService.set(this.TRANSACTIONS_KEY, transactions);
    this.transactionsSubject.next(transactions);
  }

  async addExpense(expense: Expense): Promise<void> {
    const expenses = [...this.expensesSubject.value];
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

  getTransactions(): Transaction[] {
    return this.transactionsSubject.value;
  }

  getTransactionsByType(type: 'expense' | 'income'): Transaction[] {
    return this.transactionsSubject.value.filter(t => t.type === type);
  }

  getMonthlyExpenses(month: string, year: number): Expense[] {
    return this.expensesSubject.value.filter(expense => {
      const expenseDate = new Date(expense.date);
      const expenseMonth = expenseDate.toLocaleString('en-US', { month: 'long' });
      return expenseMonth === month && expenseDate.getFullYear() === year;
    });
  }

  getMonthlyTransactions(month: string, year: number, type?: 'expense' | 'income'): Transaction[] {
    return this.transactionsSubject.value.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      const transactionMonth = transactionDate.toLocaleString('en-US', { month: 'long' });
      const matchesDate = transactionMonth === month && transactionDate.getFullYear() === year;
      const matchesType = type ? transaction.type === type : true;
      return matchesDate && matchesType;
    });
  }

  setSelectedMonthYear(month: string, year: number): void {
    this.selectedMonthYearSubject.next({ month, year });
    // Update budget data to match selected month/year
    this.saveBudgetData({ month, year });
  }

  getSelectedMonthYear(): { month: string; year: number } {
    return this.selectedMonthYearSubject.value;
  }
}

