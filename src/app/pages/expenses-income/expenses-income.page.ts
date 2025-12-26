import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { BudgetDataService } from '@services/budget/budget-data.service';
import { PlannedBudgetService } from '@services/budget/planned-budget.service';
import { ExpensesIncomeService } from '@services/budget/expenses-income.service';
import { CategoryService } from '@services/category/category.service';
import { ExpensesIncomeSummary, CategoryBudget, IncomeBudget, Transaction } from '@models/budget.model';
import { SetPlannedBudgetModalComponent, ActualBudgetData } from '@shared/modals/set-planned-budget-modal/set-planned-budget-modal.component';

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
    private plannedBudgetService: PlannedBudgetService,
    private expensesIncomeService: ExpensesIncomeService,
    private categoryService: CategoryService,
    private modalController: ModalController
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

    this.budgetDataService.transactions$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateSummary();
      });

    this.budgetDataService.selectedMonthYear$
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

  async setPlannedBudget(category: string, type: 'expense' | 'income', currentPlanned: number) {
    const budgetData = this.budgetDataService.getBudgetData();
    if (!budgetData) return;

    const modal = await this.modalController.create({
      component: SetPlannedBudgetModalComponent,
      componentProps: {
        category,
        type,
        currentPlanned,
        mode: 'planned'
      }
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm' && data) {
      await this.plannedBudgetService.setPlannedBudget(
        data.category,
        data.type,
        data.plannedAmount,
        budgetData.month,
        budgetData.year
      );
      this.updateSummary();
    }
  }

  async setActualIncome(source: string, currentActual: number) {
    const budgetData = this.budgetDataService.getBudgetData();
    if (!budgetData) return;

    const modal = await this.modalController.create({
      component: SetPlannedBudgetModalComponent,
      componentProps: {
        category: source,
        type: 'income',
        currentPlanned: currentActual,
        mode: 'actual'
      }
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss<ActualBudgetData>();

    if (role === 'confirm' && data) {
      // Get all income transactions for this source in the current month
      const monthlyTransactions = this.budgetDataService.getMonthlyTransactions(
        budgetData.month,
        budgetData.year,
        'income'
      );
      
      const sourceTransactions = monthlyTransactions.filter(
        t => t.category === source
      );

      // Delete all existing transactions for this source
      for (const transaction of sourceTransactions) {
        await this.budgetDataService.deleteTransaction(transaction.id);
      }

      // Create a new transaction with the new amount (if amount > 0)
      if (data.actualAmount > 0) {
        // Get category color
        const category = this.categoryService.getCategoryByName(source, 'income');
        const categoryColor = category?.color || '#61FF36'; // Default green for income

        // Convert month name to index
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
        const monthIndex = months.indexOf(budgetData.month);

        const newTransaction: Transaction = {
          id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'income',
          category: source,
          categoryColor: categoryColor,
          amount: data.actualAmount,
          description: `${source} income`,
          date: new Date(budgetData.year, monthIndex, 1)
        };

        await this.budgetDataService.addTransaction(newTransaction);
      }

      this.updateSummary();
    }
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
}
