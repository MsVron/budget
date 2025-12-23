import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { BudgetService } from '@services/budget';
import { BudgetData, MonthlyBudgetSummary } from '@models/budget.model';

@Component({
  selector: 'app-monthly-budget',
  templateUrl: './monthly-budget.page.html',
  styleUrls: ['./monthly-budget.page.scss'],
  standalone: false
})
export class MonthlyBudgetPage implements OnInit, OnDestroy {
  budgetData: BudgetData | null = null;
  summary: MonthlyBudgetSummary = {
    startingBalance: 0,
    endBalance: 0,
    spentAmount: 0,
    savingsPercentage: 0,
    totalSaved: 0
  };

  chartMaxHeight = 200;
  
  private destroy$ = new Subject<void>();

  constructor(private budgetService: BudgetService) { }

  ngOnInit() {
    this.budgetService.budgetData$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.budgetData = data;
        this.updateSummary();
      });

    this.budgetService.expenses$
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
    this.summary = this.budgetService.calculateMonthlySummary();
  }

  getBarHeight(amount: number): number {
    if (amount <= 0) return 20;
    
    const maxAmount = Math.max(this.summary.startingBalance, this.summary.endBalance);
    if (maxAmount === 0) return 20;
    
    const minHeight = 40;
    const calculatedHeight = (amount / maxAmount) * this.chartMaxHeight;
    
    return Math.max(minHeight, calculatedHeight);
  }

  getTotalBalanceHeight(): number {
    return this.getBarHeight(this.summary.startingBalance);
  }

  getEndBalanceHeight(): number {
    return this.getBarHeight(this.summary.endBalance);
  }

  formatCurrency(amount: number): string {
    return `dh${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  get currentMonth(): string {
    return this.budgetData?.month || 'August';
  }

  get currentYear(): number {
    return this.budgetData?.year || 2025;
  }
}
