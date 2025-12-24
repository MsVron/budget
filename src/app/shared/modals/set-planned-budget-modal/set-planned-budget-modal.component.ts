import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export interface PlannedBudgetData {
  category: string;
  type: 'expense' | 'income';
  plannedAmount: number;
}

@Component({
  selector: 'app-set-planned-budget-modal',
  templateUrl: './set-planned-budget-modal.component.html',
  styleUrls: ['./set-planned-budget-modal.component.scss'],
  standalone: false
})
export class SetPlannedBudgetModalComponent implements OnInit {
  @Input() category!: string;
  @Input() type!: 'expense' | 'income';
  @Input() currentPlanned: number = 0;

  budgetForm: FormGroup;

  constructor(
    private modalController: ModalController,
    private formBuilder: FormBuilder
  ) {
    this.budgetForm = this.formBuilder.group({
      plannedAmount: ['', [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit() {
    if (this.currentPlanned > 0) {
      this.budgetForm.patchValue({
        plannedAmount: this.currentPlanned
      });
    }
  }

  onCancel() {
    this.modalController.dismiss(null, 'cancel');
  }

  onConfirm() {
    if (this.budgetForm.valid) {
      const plannedBudgetData: PlannedBudgetData = {
        category: this.category,
        type: this.type,
        plannedAmount: parseFloat(this.budgetForm.value.plannedAmount)
      };
      
      this.modalController.dismiss(plannedBudgetData, 'confirm');
    }
  }

  isFormValid(): boolean {
    return this.budgetForm.valid;
  }
}

