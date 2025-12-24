import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export interface TransactionData {
  type: 'expense' | 'income';
  category: string;
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
  transactionType: 'expense' | 'income' = 'expense';
  maxDate: string = new Date().toISOString();

  expenseCategories = [
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Bills & Utilities',
    'Healthcare',
    'Education',
    'Personal Care',
    'Home',
    'Other'
  ];

  incomeCategories = [
    'Salary',
    'Freelance',
    'Bonus',
    'Investment',
    'Gift',
    'Other'
  ];

  constructor(
    private modalController: ModalController,
    private formBuilder: FormBuilder
  ) {
    this.transactionForm = this.formBuilder.group({
      type: ['expense', Validators.required],
      category: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      date: [new Date().toISOString(), Validators.required],
      description: ['']
    });
  }

  ngOnInit() {
    // Listen to type changes to reset category
    this.transactionForm.get('type')?.valueChanges.subscribe(type => {
      this.transactionType = type;
      this.transactionForm.patchValue({ category: '' });
    });
  }

  get categories(): string[] {
    return this.transactionType === 'expense' ? this.expenseCategories : this.incomeCategories;
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
}