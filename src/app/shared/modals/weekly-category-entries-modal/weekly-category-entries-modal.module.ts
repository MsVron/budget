import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { WeeklyCategoryEntriesModalComponent } from './weekly-category-entries-modal.component';

@NgModule({
  declarations: [WeeklyCategoryEntriesModalComponent],
  imports: [
    CommonModule,
    IonicModule
  ],
  exports: [WeeklyCategoryEntriesModalComponent]
})
export class WeeklyCategoryEntriesModalModule { }

