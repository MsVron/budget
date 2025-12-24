import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { StorageService } from '../core/storage.service';
import { PlannedBudget } from '@models/budget.model';

@Injectable({
  providedIn: 'root',
})
export class PlannedBudgetService {
  private readonly PLANNED_BUDGETS_KEY = 'plannedBudgets';

  private plannedBudgetsSubject = new BehaviorSubject<PlannedBudget[]>([]);
  plannedBudgets$: Observable<PlannedBudget[]> = this.plannedBudgetsSubject.asObservable();

  constructor(private storageService: StorageService) {
    this.loadPlannedBudgets();
  }

  private async loadPlannedBudgets(): Promise<void> {
    const budgets = await this.storageService.get(this.PLANNED_BUDGETS_KEY);
    if (budgets && budgets.length > 0) {
      this.plannedBudgetsSubject.next(budgets);
    } else {
      this.plannedBudgetsSubject.next([]);
    }
  }

  async setPlannedBudget(category: string, type: 'expense' | 'income', plannedAmount: number, month: string, year: number): Promise<void> {
    const budgets = [...this.plannedBudgetsSubject.value];
    const existingIndex = budgets.findIndex(
      b => b.category === category && b.type === type && b.month === month && b.year === year
    );

    if (existingIndex !== -1) {
      // Update existing
      budgets[existingIndex].plannedAmount = plannedAmount;
    } else {
      // Add new
      const newBudget: PlannedBudget = {
        id: `${Date.now()}-${Math.random()}`,
        category,
        type,
        plannedAmount,
        month,
        year
      };
      budgets.push(newBudget);
    }

    await this.storageService.set(this.PLANNED_BUDGETS_KEY, budgets);
    this.plannedBudgetsSubject.next(budgets);
  }

  async deletePlannedBudget(id: string): Promise<void> {
    const budgets = this.plannedBudgetsSubject.value.filter(b => b.id !== id);
    await this.storageService.set(this.PLANNED_BUDGETS_KEY, budgets);
    this.plannedBudgetsSubject.next(budgets);
  }

  getPlannedBudget(category: string, type: 'expense' | 'income', month: string, year: number): number {
    const budget = this.plannedBudgetsSubject.value.find(
      b => b.category === category && b.type === type && b.month === month && b.year === year
    );
    return budget?.plannedAmount || 0;
  }

  getPlannedBudgets(type?: 'expense' | 'income', month?: string, year?: number): PlannedBudget[] {
    let budgets = this.plannedBudgetsSubject.value;

    if (type) {
      budgets = budgets.filter(b => b.type === type);
    }
    if (month && year) {
      budgets = budgets.filter(b => b.month === month && b.year === year);
    }

    return budgets;
  }

  getAllPlannedBudgets(): PlannedBudget[] {
    return this.plannedBudgetsSubject.value;
  }
}

