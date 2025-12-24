import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Category {
  id: string;
  name: string;
  type: 'expense' | 'income';
  color: string;
  isDefault: boolean;
  isUserAdded?: boolean; // Track if user explicitly added this category
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly STORAGE_KEY = 'budget_categories';
  
  private defaultExpenseCategories: Category[] = [
    { id: '1', name: 'Food & Dining', type: 'expense', color: '#FF3636', isDefault: true },
    { id: '2', name: 'Transportation', type: 'expense', color: '#36B5FF', isDefault: true },
    { id: '3', name: 'Shopping', type: 'expense', color: '#FF3679', isDefault: true },
    { id: '4', name: 'Entertainment', type: 'expense', color: '#9436FF', isDefault: true },
    { id: '5', name: 'Bills & Utilities', type: 'expense', color: '#3675FF', isDefault: true },
    { id: '6', name: 'Healthcare', type: 'expense', color: '#FFBF36', isDefault: true },
    { id: '7', name: 'Education', type: 'expense', color: '#00BFA5', isDefault: true },
    { id: '8', name: 'Personal Care', type: 'expense', color: '#A8D900', isDefault: true },
    { id: '9', name: 'Home', type: 'expense', color: '#00897B', isDefault: true },
    { id: '10', name: 'Other', type: 'expense', color: '#795548', isDefault: true }
  ];

  private defaultIncomeCategories: Category[] = [
    { id: '11', name: 'Salary', type: 'income', color: '#4CAF50', isDefault: true },
    { id: '12', name: 'Freelance', type: 'income', color: '#36B5FF', isDefault: true },
    { id: '13', name: 'Bonus', type: 'income', color: '#FFC107', isDefault: true },
    { id: '14', name: 'Investment', type: 'income', color: '#5C6BC0', isDefault: true },
    { id: '15', name: 'Gift', type: 'income', color: '#FF3679', isDefault: true },
    { id: '16', name: 'Other', type: 'income', color: '#8D6E63', isDefault: true }
  ];

  private categoriesSubject = new BehaviorSubject<Category[]>([]);
  public categories$: Observable<Category[]> = this.categoriesSubject.asObservable();

  constructor() {
    this.loadCategories();
  }

  private loadCategories(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const categories = JSON.parse(stored);
        this.categoriesSubject.next(categories);
      } catch (error) {
        console.error('Error loading categories:', error);
        // Start with empty array, user will add categories as needed
        this.categoriesSubject.next([]);
        this.saveCategories([]);
      }
    } else {
      // Start with empty array, user will add categories as needed
      this.categoriesSubject.next([]);
      this.saveCategories([]);
    }
  }

  private saveCategories(categories: Category[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(categories));
    this.categoriesSubject.next(categories);
  }

  getAllCategories(): Category[] {
    return this.categoriesSubject.value;
  }

  getCategoriesByType(type: 'expense' | 'income'): Category[] {
    return this.categoriesSubject.value.filter(cat => cat.type === type);
  }

  getCategoryById(id: string): Category | undefined {
    return this.categoriesSubject.value.find(cat => cat.id === id);
  }

  getCategoryByName(name: string, type: 'expense' | 'income'): Category | undefined {
    return this.categoriesSubject.value.find(
      cat => cat.name.toLowerCase() === name.toLowerCase() && cat.type === type
    );
  }

  addCategory(name: string, type: 'expense' | 'income', color: string, isFromDefaults: boolean = false): Category {
    const categories = this.categoriesSubject.value;
    
    // Check if this is a default category being added
    const defaultCategory = [...this.defaultExpenseCategories, ...this.defaultIncomeCategories]
      .find(cat => cat.name === name && cat.type === type);
    
    const newCategory: Category = {
      id: defaultCategory?.id || this.generateId(),
      name: name.trim(),
      type,
      color,
      isDefault: !!defaultCategory,
      isUserAdded: true
    };
    
    const updatedCategories = [...categories, newCategory];
    this.saveCategories(updatedCategories);
    return newCategory;
  }

  updateCategory(id: string, updates: Partial<Category>): boolean {
    const categories = this.categoriesSubject.value;
    const index = categories.findIndex(cat => cat.id === id);
    
    if (index === -1) return false;
    
    // Allow updating all categories (user-added ones can be fully modified)
    categories[index] = { ...categories[index], ...updates };
    this.saveCategories(categories);
    return true;
  }

  deleteCategory(id: string): boolean {
    const categories = this.categoriesSubject.value;
    const category = categories.find(cat => cat.id === id);
    
    if (!category) {
      return false;
    }
    
    const updatedCategories = categories.filter(cat => cat.id !== id);
    this.saveCategories(updatedCategories);
    return true;
  }
  
  // Get available default categories that haven't been added yet
  getAvailableDefaultCategories(type: 'expense' | 'income'): Category[] {
    const userCategories = this.getCategoriesByType(type);
    const userCategoryNames = userCategories.map(c => c.name.toLowerCase());
    
    const defaults = type === 'expense' ? this.defaultExpenseCategories : this.defaultIncomeCategories;
    return defaults.filter(cat => !userCategoryNames.includes(cat.name.toLowerCase()));
  }

  categoryExists(name: string, type: 'expense' | 'income'): boolean {
    return this.categoriesSubject.value.some(
      cat => cat.name.toLowerCase() === name.toLowerCase() && cat.type === type
    );
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  // Predefined color palette for new categories
  getColorPalette(): string[] {
    return [
      '#FF3636', '#FF3679', '#36B5FF', '#A8D900', '#4CAF50',
      '#00BFA5', '#3675FF', '#9436FF', '#FFBF36', '#FFC107',
      '#795548', '#8D6E63', '#689F38', '#00897B', '#5C6BC0'
    ];
  }
}