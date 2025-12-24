import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AddTransactionModalComponent } from './add-transaction-modal.component';

@NgModule({
  declarations: [AddTransactionModalComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule
  ],
  exports: [AddTransactionModalComponent]
})
export class AddTransactionModalModule { }