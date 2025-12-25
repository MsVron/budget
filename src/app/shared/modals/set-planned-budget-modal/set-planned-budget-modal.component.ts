import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export interface PlannedBudgetData {
  category: string;
  type: 'expense' | 'income';
  plannedAmount: number;
}

export interface ActualBudgetData {
  category: string;
  type: 'expense' | 'income';
  actualAmount: number;
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
  @Input() mode: 'planned' | 'actual' = 'planned';

  budgetForm: FormGroup;

  constructor(
    private modalController: ModalController,
    private formBuilder: FormBuilder
  ) {
    this.budgetForm = this.formBuilder.group({
      amount: ['', [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit() {
    // Always set the initial value, even if it's 0
    this.budgetForm.patchValue({
      amount: this.currentPlanned || 0
    });
  }

  get title(): string {
    return this.mode === 'planned' ? 'Set Planned Budget' : 'Set Actual Amount';
  }

  get amountLabel(): string {
    return this.mode === 'planned' ? 'Planned Amount' : 'Actual Amount';
  }

  get buttonLabel(): string {
    return this.mode === 'planned' ? 'Set Budget' : 'Set Amount';
  }

  onCancel() {
    this.modalController.dismiss(null, 'cancel');
  }

  onConfirm() {
    if (this.budgetForm.valid) {
      if (this.mode === 'planned') {
        const plannedBudgetData: PlannedBudgetData = {
          category: this.category,
          type: this.type,
          plannedAmount: parseFloat(this.budgetForm.value.amount)
        };
        this.modalController.dismiss(plannedBudgetData, 'confirm');
      } else {
        const actualBudgetData: ActualBudgetData = {
          category: this.category,
          type: this.type,
          actualAmount: parseFloat(this.budgetForm.value.amount)
        };
        this.modalController.dismiss(actualBudgetData, 'confirm');
      }
    }
  }

  isFormValid(): boolean {
    return this.budgetForm.valid;
  }
}

