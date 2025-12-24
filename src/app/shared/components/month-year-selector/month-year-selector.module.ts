import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { MonthYearSelectorComponent } from './month-year-selector.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule
  ],
  declarations: [MonthYearSelectorComponent],
  exports: [MonthYearSelectorComponent]
})
export class MonthYearSelectorModule { }

