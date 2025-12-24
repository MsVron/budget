import { Injectable } from '@angular/core';
import { BudgetDataService } from './budget-data.service';
import { CategoryService } from '../category/category.service';
import { WeeklyExpensesData, WeeklyExpenseSummary, WeeklyCategoryExpense, Expense, Transaction } from '@models/budget.model';

@Injectable({
  providedIn: 'root',
})
export class WeeklyExpensesService {
  //will be managed by PlannedBudgetService
  private readonly categoryBudgets: { [key: string]: { planned: number; color?: string } } = {};

  constructor(
    private budgetDataService: BudgetDataService,
    private categoryService: CategoryService
  ) {}

  getWeeklyExpensesData(): WeeklyExpensesData {
    const budgetData = this.budgetDataService.getBudgetData();
    
    const monthlyPlannedExpenses = Object.values(this.categoryBudgets).reduce((sum, cat) => sum + cat.planned, 0);
    
    if (!budgetData) {
      return {
        weeks: [],
        monthlyPlannedExpenses
      };
    }

    // Get both transactions and legacy expenses
    const monthlyTransactions = this.budgetDataService.getMonthlyTransactions(budgetData.month, budgetData.year, 'expense');
    const monthlyExpenses = this.budgetDataService.getMonthlyExpenses(budgetData.month, budgetData.year);
    
    const weeklyExpensesMap = new Map<number, Array<Expense | Transaction>>();
    
    // Process new transactions
    monthlyTransactions.forEach(transaction => {
      const transactionDate = new Date(transaction.date);
      const weekNumber = this.getWeekOfMonth(transactionDate);
      
      if (!weeklyExpensesMap.has(weekNumber)) {
        weeklyExpensesMap.set(weekNumber, []);
      }
      weeklyExpensesMap.get(weekNumber)!.push(transaction);
    });

    // Process legacy expenses
    monthlyExpenses.forEach(expense => {
      const expenseDate = new Date(expense.date);
      const weekNumber = this.getWeekOfMonth(expenseDate);
      
      if (!weeklyExpensesMap.has(weekNumber)) {
        weeklyExpensesMap.set(weekNumber, []);
      }
      weeklyExpensesMap.get(weekNumber)!.push(expense);
    });

    const weeks: WeeklyExpenseSummary[] = [];
    
    weeklyExpensesMap.forEach((items, weekNumber) => {
      const categoriesMap = new Map<string, { amount: number; color: string }>();
      
      items.forEach(item => {
        const category = item.category;
        let color: string;
        
        // Get color from transaction or expense
        if ('categoryColor' in item && item.categoryColor) {
          color = item.categoryColor;
        } else {
          const categoryFromService = this.categoryService.getCategoryByName(category, 'expense');
          color = categoryFromService?.color || this.categoryBudgets[category]?.color || '#95A5A6';
        }
        
        if (!categoriesMap.has(category)) {
          categoriesMap.set(category, { amount: 0, color });
        }
        categoriesMap.get(category)!.amount += item.amount;
      });

      const categories: WeeklyCategoryExpense[] = Array.from(categoriesMap.entries()).map(([category, data]) => ({
        category,
        amount: data.amount,
        color: data.color
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

