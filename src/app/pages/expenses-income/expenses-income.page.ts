import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { BudgetDataService } from '@services/budget-data';
import { ExpensesIncomeService } from '@services/expenses-income';
import { ExpensesIncomeSummary, CategoryBudget, IncomeBudget } from '@models/budget.model';

@Component({
  selector: 'app-expenses-income',
  templateUrl: './expenses-income.page.html',
  styleUrls: ['./expenses-income.page.scss'],
  standalone: false
})
export class ExpensesIncomePage implements OnInit, OnDestroy {
  selectedSegment: 'expenses' | 'income' = 'expenses';
  summary: ExpensesIncomeSummary = {
    expenses: {
      categories: [],
      totalPlanned: 0,
      totalActual: 0,
      difference: 0
    },
    income: {
      sources: [],
      totalPlanned: 0,
      totalActual: 0,
      difference: 0
    }
  };

  private destroy$ = new Subject<void>();

  constructor(
    private budgetDataService: BudgetDataService,
    private expensesIncomeService: ExpensesIncomeService
  ) { }

  ngOnInit() {
    this.budgetDataService.budgetData$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateSummary();
      });

    this.budgetDataService.expenses$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateSummary();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  updateSummary() {
    this.summary = this.expensesIncomeService.getExpensesIncomeSummary();
    this.summary.expenses.categories.forEach(cat => cat.expanded = false);
    this.summary.income.sources.forEach(src => src.expanded = false);
  }

  toggleCategory(index: number, type: 'expense' | 'income') {
    if (type === 'expense') {
      const category = this.summary.expenses.categories[index];
      category.expanded = !category.expanded;
    }
  }

  toggleIncome(index: number) {
    const source = this.summary.income.sources[index];
    source.expanded = !source.expanded;
  }

  onSegmentChange(event: any) {
    this.selectedSegment = event.detail.value;
  }

  formatCurrency(amount: number): string {
    return `dh${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  getBarWidth(planned: number, actual: number): { planned: number; actual: number } {
    const max = Math.max(planned, actual);
    if (max === 0) return { planned: 0, actual: 0 };
    
    return {
      planned: (planned / max) * 100,
      actual: (actual / max) * 100
    };
  }

  getDifferenceClass(difference: number): string {
    return difference >= 0 ? 'positive' : 'negative';
  }

  get expenseCategories(): CategoryBudget[] {
    return this.summary.expenses.categories;
  }

  get incomeSources(): IncomeBudget[] {
    return this.summary.income.sources;
  }

  get totalExpensesPlanned(): number {
    return this.summary.expenses.totalPlanned;
  }

  get totalExpensesActual(): number {
    return this.summary.expenses.totalActual;
  }

  get totalExpensesDifference(): number {
    return this.summary.expenses.difference;
  }

  get totalIncomePlanned(): number {
    return this.summary.income.totalPlanned;
  }

  get totalIncomeActual(): number {
    return this.summary.income.totalActual;
  }

  get totalIncomeDifference(): number {
    return this.summary.income.difference;
  }
}
