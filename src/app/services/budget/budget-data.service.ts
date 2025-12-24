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

  budgetData$: Observable<BudgetData | null> = this.budgetDataSubject.asObservable();
  expenses$: Observable<Expense[]> = this.expensesSubject.asObservable();
  transactions$: Observable<Transaction[]> = this.transactionsSubject.asObservable();

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
        { id: '1', type: 'expense', amount: 147.15, category: 'Food', categoryColor: '#FF6B35', description: 'Groceries', date: new Date('2025-08-05') },
        { id: '2', type: 'expense', amount: 160.00, category: 'Transportation', categoryColor: '#2C3E50', description: 'Gas and parking', date: new Date('2025-08-10') },
        { id: '3', type: 'expense', amount: 519.00, category: 'Self-Care', categoryColor: '#FF3B30', description: 'Spa and wellness', date: new Date('2025-08-12') },
        { id: '4', type: 'expense', amount: 0.00, category: 'Hygiene', categoryColor: '#4CAF50', description: 'Personal care', date: new Date('2025-08-15') },
        { id: '5', type: 'expense', amount: 49.00, category: 'Phone', categoryColor: '#2C3E50', description: 'Mobile bill', date: new Date('2025-08-20') }
      ];
      await this.storageService.set(this.EXPENSES_KEY, sampleExpenses);
      this.expensesSubject.next(sampleExpenses);
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
}

