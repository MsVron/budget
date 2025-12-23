import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { TabsShellComponent } from './tabs-shell.component';

const routes: Routes = [
  {
    path: '',
    component: TabsShellComponent,
    children: [
      {
        path: 'monthly-budget',
        loadChildren: () => import('../../pages/monthly-budget/monthly-budget.module').then(m => m.MonthlyBudgetPageModule)
      },
      {
        path: 'expenses-income',
        loadChildren: () => import('../../pages/expenses-income/expenses-income.module').then(m => m.ExpensesIncomePageModule)
      },
      {
        path: 'weekly-expenses',
        loadChildren: () => import('../../pages/weekly-expenses/weekly-expenses.module').then(m => m.WeeklyExpensesPageModule)
      },
      {
        path: 'settings',
        loadChildren: () => import('../../pages/settings/settings.module').then(m => m.SettingsPageModule)
      },
      {
        path: '',
        redirectTo: 'monthly-budget',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  declarations: [TabsShellComponent],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild(routes)
  ]
})
export class TabsShellModule { }

