import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { BudgetDataService } from '@services/budget/budget-data.service';
import { WeeklyExpensesService } from '@services/budget/weekly-expenses.service';
import { WeeklyExpensesData, WeeklyExpenseSummary } from '@models/budget.model';

@Component({
  selector: 'app-weekly-expenses',
  templateUrl: './weekly-expenses.page.html',
  styleUrls: ['./weekly-expenses.page.scss'],
  standalone: false
})
export class WeeklyExpensesPage implements OnInit, OnDestroy {
  weeklyData: WeeklyExpensesData = {
    weeks: [],
    monthlyPlannedExpenses: 0
  };

  private destroy$ = new Subject<void>();

  constructor(
    private budgetDataService: BudgetDataService,
    private weeklyExpensesService: WeeklyExpensesService
  ) { }

  ngOnInit() {
    this.budgetDataService.budgetData$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadWeeklyData();
      });

    this.budgetDataService.expenses$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadWeeklyData();
      });

    this.budgetDataService.transactions$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadWeeklyData();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadWeeklyData() {
    this.weeklyData = this.weeklyExpensesService.getWeeklyExpensesData();
  }

  formatCurrency(amount: number): string {
    return `dh${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  formatPercentage(percentage: number): string {
    return `${percentage.toFixed(2)}%`;
  }

  formatDateRange(week: WeeklyExpenseSummary): string {
    const startDate = new Date(week.startDate);
    const endDate = new Date(week.endDate);
    
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const start = startDate.toLocaleDateString('en-US', options);
    const end = endDate.toLocaleDateString('en-US', options);
    
    return `${start} - ${end}`;
  }

  get hasWeeklyData(): boolean {
    return this.weeklyData.weeks.length > 0;
  }
}
