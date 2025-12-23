import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ExpensesIncomePageRoutingModule } from './expenses-income-routing.module';

import { ExpensesIncomePage } from './expenses-income.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ExpensesIncomePageRoutingModule
  ],
  declarations: [ExpensesIncomePage]
})
export class ExpensesIncomePageModule {}
