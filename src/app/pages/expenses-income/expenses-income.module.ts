import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ExpensesIncomePageRoutingModule } from './expenses-income-routing.module';
import { SetPlannedBudgetModalModule } from '@shared/modals/set-planned-budget-modal/set-planned-budget-modal.module';
import { MonthYearSelectorModule } from '@shared/components/month-year-selector/month-year-selector.module';

import { ExpensesIncomePage } from './expenses-income.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ExpensesIncomePageRoutingModule,
    SetPlannedBudgetModalModule,
    MonthYearSelectorModule
  ],
  declarations: [ExpensesIncomePage]
})
export class ExpensesIncomePageModule {}
