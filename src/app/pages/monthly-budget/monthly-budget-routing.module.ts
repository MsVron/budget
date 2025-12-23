import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MonthlyBudgetPage } from './monthly-budget.page';

const routes: Routes = [
  {
    path: '',
    component: MonthlyBudgetPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MonthlyBudgetPageRoutingModule {}
