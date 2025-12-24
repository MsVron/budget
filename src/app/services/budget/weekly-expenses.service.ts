import { Injectable } from '@angular/core';
import { BudgetDataService } from './budget-data.service';
import { WeeklyExpensesData, WeeklyExpenseSummary, WeeklyCategoryExpense, Expense } from '@models/budget.model';

@Injectable({
  providedIn: 'root',
})
export class WeeklyExpensesService {
  private readonly categoryBudgets: { [key: string]: { planned: number; color?: string } } = {
    'Food': { planned: 266.50, color: '#FF6B35' },
    'Transportation': { planned: 350.00, color: '#2C3E50' },
    'Self-Care': { planned: 330.00, color: '#FF3B30' },
    'Hygiene': { planned: 88.00, color: '#4CAF50' },
    'Phone': { planned: 49.00, color: '#2C3E50' }
  };

  constructor(private budgetDataService: BudgetDataService) {}

  getWeeklyExpensesData(): WeeklyExpensesData {
    const budgetData = this.budgetDataService.getBudgetData();
    
    const monthlyPlannedExpenses = Object.values(this.categoryBudgets).reduce((sum, cat) => sum + cat.planned, 0);
    
    if (!budgetData) {
      return {
        weeks: [],
        monthlyPlannedExpenses
      };
    }

    const monthlyExpenses = this.budgetDataService.getMonthlyExpenses(budgetData.month, budgetData.year);
    
    const weeklyExpensesMap = new Map<number, Expense[]>();
    
    monthlyExpenses.forEach(expense => {
      const expenseDate = new Date(expense.date);
      const weekNumber = this.getWeekOfMonth(expenseDate);
      
      if (!weeklyExpensesMap.has(weekNumber)) {
        weeklyExpensesMap.set(weekNumber, []);
      }
      weeklyExpensesMap.get(weekNumber)!.push(expense);
    });

    const weeks: WeeklyExpenseSummary[] = [];
    
    weeklyExpensesMap.forEach((expenses, weekNumber) => {
      const categoriesMap = new Map<string, number>();
      
      expenses.forEach(expense => {
        const currentAmount = categoriesMap.get(expense.category) || 0;
        categoriesMap.set(expense.category, currentAmount + expense.amount);
      });

      const categories: WeeklyCategoryExpense[] = Array.from(categoriesMap.entries()).map(([category, amount]) => ({
        category,
        amount,
        color: this.categoryBudgets[category]?.color || '#2C3E50'
      }));

      const totalSpent = categories.reduce((sum, cat) => sum + cat.amount, 0);
      const percentageOfMonthlyBudget = monthlyPlannedExpenses > 0 
        ? (totalSpent / monthlyPlannedExpenses) * 100 
        : 0;

      const monthIndex = new Date(budgetData.year, this.getMonthIndex(budgetData.month), 1).getMonth();
      const { start, end } = this.getWeekStartAndEnd(weekNumber, monthIndex, budgetData.year);

      weeks.push({
        weekNumber,
        startDate: start,
        endDate: end,
        categories,
        totalSpent,
        percentageOfMonthlyBudget
      });
    });

    weeks.sort((a, b) => a.weekNumber - b.weekNumber);

    return {
      weeks,
      monthlyPlannedExpenses
    };
  }

  private getWeekOfMonth(date: Date): number {
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const firstDayWeekday = firstDayOfMonth.getDay();
    const dayOfMonth = date.getDate();
    const adjustedDay = dayOfMonth + firstDayWeekday - 1;
    return Math.ceil(adjustedDay / 7);
  }

  private getWeekStartAndEnd(weekNumber: number, month: number, year: number): { start: Date; end: Date } {
    const firstDayOfMonth = new Date(year, month, 1);
    const firstDayWeekday = firstDayOfMonth.getDay();
    
    const weekStartDay = (weekNumber - 1) * 7 - firstDayWeekday + 1;
    const weekStart = new Date(year, month, weekStartDay);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    const lastDayOfMonth = new Date(year, month + 1, 0);
    if (weekEnd > lastDayOfMonth) {
      return { start: weekStart, end: lastDayOfMonth };
    }
    
    return { start: weekStart, end: weekEnd };
  }

  private getMonthIndex(monthName: string): number {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
    return months.indexOf(monthName);
  }
}

