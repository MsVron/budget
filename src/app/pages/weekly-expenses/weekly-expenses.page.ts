import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { BudgetDataService } from '@services/budget/budget-data.service';
import { WeeklyExpensesService } from '@services/budget/weekly-expenses.service';
import { WeeklyExpensesData, WeeklyExpenseSummary, WeeklyCategoryExpense } from '@models/budget.model';
import { WeeklyCategoryEntriesModalComponent } from '@shared/modals/weekly-category-entries-modal/weekly-category-entries-modal.component';

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
    private weeklyExpensesService: WeeklyExpensesService,
    private modalController: ModalController
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

    this.budgetDataService.selectedMonthYear$
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

  get currentMonth(): string {
    return this.budgetDataService.getBudgetData()?.month || new Date().toLocaleString('en-US', { month: 'long' });
  }

  get currentYear(): number {
    return this.budgetDataService.getBudgetData()?.year || new Date().getFullYear();
  }

  onMonthYearChange(event: { month: string; year: number }) {
    this.budgetDataService.setSelectedMonthYear(event.month, event.year);
  }

  async onCategoryClick(category: WeeklyCategoryExpense, week: WeeklyExpenseSummary) {
    const modal = await this.modalController.create({
      component: WeeklyCategoryEntriesModalComponent,
      componentProps: {
        categoryName: category.category,
        categoryColor: category.color || '#95A5A6',
        weekNumber: week.weekNumber,
        weekStartDate: week.startDate,
        weekEndDate: week.endDate,
        entries: category.entries || []
      },
      cssClass: 'weekly-category-entries-modal'
    });

    await modal.present();
  }
}
