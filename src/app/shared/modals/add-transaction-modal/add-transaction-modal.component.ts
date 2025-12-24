import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoryService, Category } from '@services/category/category.service';

export interface TransactionData {
  type: 'expense' | 'income';
  category: string;
  categoryColor: string;
  amount: number;
  date: Date;
  description?: string;
}

@Component({
  selector: 'app-add-transaction-modal',
  templateUrl: './add-transaction-modal.component.html',
  styleUrls: ['./add-transaction-modal.component.scss'],
  standalone: false
})
export class AddTransactionModalComponent implements OnInit {
  transactionForm: FormGroup;
  newCategoryForm: FormGroup;
  transactionType: 'expense' | 'income' = 'expense';
  maxDate: string = new Date().toISOString();
  categories: Category[] = [];
  selectedCategoryColor: string = '#FF6B6B';
  
  // Category management state
  showCategoryModal: boolean = false;
  showManageCategoriesModal: boolean = false;
  colorPalette: string[] = [];
  selectedNewCategoryColor: string = '';
  editingCategory: Category | null = null;
  availableDefaultCategories: Category[] = [];

  constructor(
    private modalController: ModalController,
    private formBuilder: FormBuilder,
    private categoryService: CategoryService
  ) {
    this.transactionForm = this.formBuilder.group({
      type: ['expense', Validators.required],
      category: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      date: [new Date().toISOString(), Validators.required],
      description: ['']
    });

    this.newCategoryForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(30)]]
    });
  }

  ngOnInit() {
    this.colorPalette = this.categoryService.getColorPalette();
    this.selectedNewCategoryColor = this.colorPalette[0];
    this.loadCategories();
    this.loadAvailableDefaults();
    
    // Listen to type changes to reset category
    this.transactionForm.get('type')?.valueChanges.subscribe(type => {
      this.transactionType = type;
      this.transactionForm.patchValue({ category: '' });
      this.loadCategories();
      this.loadAvailableDefaults();
    });

    // Listen to category changes to update color
    this.transactionForm.get('category')?.valueChanges.subscribe(categoryName => {
      const category = this.categories.find(c => c.name === categoryName);
      if (category) {
        this.selectedCategoryColor = category.color;
      }
    });
  }

  loadCategories() {
    this.categories = this.categoryService.getCategoriesByType(this.transactionType);
  }

  loadAvailableDefaults() {
    this.availableDefaultCategories = this.categoryService.getAvailableDefaultCategories(this.transactionType);
  }

  onCategoryChange(event: any) {
    const categoryName = event.target.value;
    const category = this.categories.find(c => c.name === categoryName);
    if (category) {
      this.selectedCategoryColor = category.color;
    }
  }

  openCategoryManagement() {
    this.editingCategory = null;
    this.newCategoryForm.reset();
    this.selectedNewCategoryColor = this.colorPalette[0];
    this.showCategoryModal = true;
  }

  closeCategoryManagement() {
    this.showCategoryModal = false;
    this.editingCategory = null;
    this.newCategoryForm.reset();
  }

  openManageCategories() {
    this.showManageCategoriesModal = true;
  }

  closeManageCategories() {
    this.showManageCategoriesModal = false;
  }

  editCategoryFromManage(category: Category) {
    this.showManageCategoriesModal = false;
    this.editingCategory = category;
    this.newCategoryForm.patchValue({ name: category.name });
    this.selectedNewCategoryColor = category.color;
    this.showCategoryModal = true;
  }

  deleteCategoryFromManage(category: Category) {
    if (confirm(`Are you sure you want to delete "${category.name}"?`)) {
      this.categoryService.deleteCategory(category.id);
      
      // Clear selection if this was the selected category
      if (this.transactionForm.get('category')?.value === category.name) {
        this.transactionForm.patchValue({ category: '' });
        this.selectedCategoryColor = '#FF6B6B';
      }
      
      this.loadCategories();
      this.loadAvailableDefaults();
    }
  }

  selectNewCategoryColor(color: string) {
    this.selectedNewCategoryColor = color;
  }

  isNewCategoryColorSelected(color: string): boolean {
    return this.selectedNewCategoryColor === color;
  }

  selectDefaultCategory(defaultCat: Category) {
    this.newCategoryForm.patchValue({ name: defaultCat.name });
    this.selectedNewCategoryColor = defaultCat.color;
  }

  saveCategory() {
    if (this.newCategoryForm.valid) {
      const categoryName = this.newCategoryForm.get('name')?.value.trim();
      
      if (this.editingCategory) {
        // Update existing category
        this.categoryService.updateCategory(this.editingCategory.id, {
          name: categoryName,
          color: this.selectedNewCategoryColor
        });
        
        // Update form if this was the selected category
        if (this.transactionForm.get('category')?.value === this.editingCategory.name) {
          this.transactionForm.patchValue({ category: categoryName });
          this.selectedCategoryColor = this.selectedNewCategoryColor;
        }
      } else {
        // Check if category already exists
        if (this.categoryService.categoryExists(categoryName, this.transactionType)) {
          this.newCategoryForm.get('name')?.setErrors({ duplicate: true });
          return;
        }

        // Add new category
        const newCategory = this.categoryService.addCategory(
          categoryName,
          this.transactionType,
          this.selectedNewCategoryColor
        );

        // Select the new category
        this.transactionForm.patchValue({ category: newCategory.name });
        this.selectedCategoryColor = newCategory.color;
      }

      // Reload categories and close modal
      this.loadCategories();
      this.loadAvailableDefaults();
      this.closeCategoryManagement();
    }
  }


  onCancel() {
    this.modalController.dismiss(null, 'cancel');
  }

  onConfirm() {
    if (this.transactionForm.valid) {
      const formValue = this.transactionForm.value;
      const transactionData: TransactionData = {
        type: formValue.type,
        category: formValue.category,
        categoryColor: this.selectedCategoryColor,
        amount: parseFloat(formValue.amount),
        date: new Date(formValue.date),
        description: formValue.description
      };
      
      this.modalController.dismiss(transactionData, 'confirm');
    }
  }

  isFormValid(): boolean {
    return this.transactionForm.valid;
  }

  getCategoryColor(categoryName: string): string {
    const category = this.categories.find(c => c.name === categoryName);
    return category?.color || '#95A5A6';
  }

  hasNewCategoryError(errorType: string): boolean {
    const control = this.newCategoryForm.get('name');
    return !!(control?.touched && control?.hasError(errorType));
  }
}