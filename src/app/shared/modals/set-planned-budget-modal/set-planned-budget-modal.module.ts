import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SetPlannedBudgetModalComponent } from './set-planned-budget-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule
  ],
  declarations: [SetPlannedBudgetModalComponent],
  exports: [SetPlannedBudgetModalComponent]
})
export class SetPlannedBudgetModalModule { }

