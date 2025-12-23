import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WeeklyExpensesPage } from './weekly-expenses.page';

const routes: Routes = [
  {
    path: '',
    component: WeeklyExpensesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WeeklyExpensesPageRoutingModule {}
