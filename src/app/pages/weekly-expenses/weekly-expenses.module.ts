import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WeeklyExpensesPageRoutingModule } from './weekly-expenses-routing.module';
import { MonthYearSelectorModule } from '@shared/components/month-year-selector/month-year-selector.module';
import { WeeklyCategoryEntriesModalModule } from '@shared/modals/weekly-category-entries-modal/weekly-category-entries-modal.module';

import { WeeklyExpensesPage } from './weekly-expenses.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WeeklyExpensesPageRoutingModule,
    MonthYearSelectorModule,
    WeeklyCategoryEntriesModalModule
  ],
  declarations: [WeeklyExpensesPage]
})
export class WeeklyExpensesPageModule {}
