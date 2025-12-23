import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WeeklyExpensesPageRoutingModule } from './weekly-expenses-routing.module';

import { WeeklyExpensesPage } from './weekly-expenses.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WeeklyExpensesPageRoutingModule
  ],
  declarations: [WeeklyExpensesPage]
})
export class WeeklyExpensesPageModule {}
