import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ExpensesIncomePage } from './expenses-income.page';

const routes: Routes = [
  {
    path: '',
    component: ExpensesIncomePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExpensesIncomePageRoutingModule {}
