import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ModalController, AlertController } from '@ionic/angular';
import { BudgetDataService } from '@services/budget/budget-data.service';
import { WeeklyExpensesService } from '@services/budget/weekly-expenses.service';
import { WeeklyExpensesData, WeeklyExpenseSummary, WeeklyCategoryExpense, Transaction, Expense } from '@models/budget.model';
import { WeeklyCategoryEntriesModalComponent } from '@shared/modals/weekly-category-entries-modal/weekly-category-entries-modal.component';
import { AddTransactionModalComponent } from '@shared/modals/add-transaction-modal/add-transaction-modal.component';

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
    private modalController: ModalController,
    private alertController: AlertController
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
    
    const { data } = await modal.onDidDismiss();
    
    if (data && data.action && data.entry) {
      if (data.action === 'edit') {
        this.handleEditEntry(data.entry);
      } else if (data.action === 'delete') {
        this.handleDeleteEntry(data.entry);
      }
    }
  }

  private async handleEditEntry(entry: any) {
    const isTransaction = this.isTransaction(entry);
    
    const modal = await this.modalController.create({
      component: AddTransactionModalComponent,
      componentProps: {
        editMode: true,
        editData: {
          id: entry.id,
          type: isTransaction ? (entry as Transaction).type : 'expense',
          category: isTransaction ? (entry as Transaction).category : (entry as Expense).category,
          categoryColor: isTransaction ? (entry as Transaction).categoryColor : (entry as Expense).categoryColor || '#95A5A6',
          amount: entry.amount,
          date: entry.date,
          description: entry.description
        }
      }
    });

    await modal.present();
    
    const { data, role } = await modal.onDidDismiss();
    
    if (role === 'confirm' && data) {
      // Update the transaction or expense
      if (isTransaction) {
        const updatedTransaction: Transaction = {
          id: entry.id,
          type: data.type,
          category: data.category,
          categoryColor: data.categoryColor,
          amount: data.amount,
          date: data.date,
          description: data.description
        };
        await this.budgetDataService.updateTransaction(updatedTransaction);
      } else {
        const updatedExpense: Expense = {
          id: entry.id,
          type: data.type,
          category: data.category,
          categoryColor: data.categoryColor,
          amount: data.amount,
          date: data.date,
          description: data.description
        };
        await this.budgetDataService.updateExpense(updatedExpense);
      }
    }
  }

  private async handleDeleteEntry(entry: any) {
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: `Are you sure you want to delete this ${this.formatCurrency(entry.amount)} entry?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: async () => {
            const allTransactions = this.budgetDataService.getTransactions();
            const transaction = allTransactions.find(t => t.id === entry.id);
            
            if (transaction) {
              await this.budgetDataService.deleteTransaction(entry.id);
            } else {
              await this.budgetDataService.deleteExpense(entry.id);
            }
          }
        }
      ]
    });

    await alert.present();
  }

  private isTransaction(entry: any): entry is Transaction {
    // Check if entry has 'type' property which is specific to Transaction
    return 'type' in entry && (entry.type === 'expense' || entry.type === 'income');
  }
}
