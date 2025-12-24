// THIS IS A TEST FILE FOR THE CATEGORY SERVICE

import { TestBed } from '@angular/core/testing';
import { CategoryService } from './category.service';

describe('CategoryService', () => {
  let service: CategoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CategoryService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with default categories', () => {
    const categories = service.getAllCategories();
    expect(categories.length).toBeGreaterThan(0);
  });

  it('should get categories by type', () => {
    const expenseCategories = service.getCategoriesByType('expense');
    const incomeCategories = service.getCategoriesByType('income');
    
    expect(expenseCategories.every(cat => cat.type === 'expense')).toBeTruthy();
    expect(incomeCategories.every(cat => cat.type === 'income')).toBeTruthy();
  });

  it('should add a new category', () => {
    const initialCount = service.getAllCategories().length;
    const newCategory = service.addCategory('Test Category', 'expense', '#FF0000');
    
    expect(newCategory.name).toBe('Test Category');
    expect(newCategory.type).toBe('expense');
    expect(newCategory.color).toBe('#FF0000');
    expect(service.getAllCategories().length).toBe(initialCount + 1);
  });

  it('should check if category exists', () => {
    service.addCategory('Existing Category', 'expense', '#FF0000');
    
    expect(service.categoryExists('Existing Category', 'expense')).toBeTruthy();
    expect(service.categoryExists('Non-existent Category', 'expense')).toBeFalsy();
  });

  it('should not delete default categories', () => {
    const defaultCategory = service.getCategoriesByType('expense')[0];
    const result = service.deleteCategory(defaultCategory.id);
    
    expect(result).toBeFalsy();
    expect(service.getCategoryById(defaultCategory.id)).toBeDefined();
  });

  it('should delete custom categories', () => {
    const customCategory = service.addCategory('Custom', 'expense', '#FF0000');
    const result = service.deleteCategory(customCategory.id);
    
    expect(result).toBeTruthy();
    expect(service.getCategoryById(customCategory.id)).toBeUndefined();
  });

  it('should persist categories to localStorage', () => {
    service.addCategory('Persisted Category', 'expense', '#FF0000');
    
    const stored = localStorage.getItem('budget_categories');
    expect(stored).toBeTruthy();
    
    const categories = JSON.parse(stored!);
    expect(categories.some((cat: any) => cat.name === 'Persisted Category')).toBeTruthy();
  });
});