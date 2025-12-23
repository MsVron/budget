import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MonthlyBudgetPageRoutingModule } from './monthly-budget-routing.module';

import { MonthlyBudgetPage } from './monthly-budget.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MonthlyBudgetPageRoutingModule
  ],
  declarations: [MonthlyBudgetPage]
})
export class MonthlyBudgetPageModule {}
