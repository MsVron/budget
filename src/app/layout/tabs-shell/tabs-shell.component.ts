import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AddTransactionModalComponent, TransactionData } from '../../shared/modals/add-transaction-modal/add-transaction-modal.component';
import { BudgetDataService } from '@services/budget/budget-data.service';
import { Transaction } from '@models/budget.model';

@Component({
  selector: 'app-tabs-shell',
  templateUrl: './tabs-shell.component.html',
  styleUrls: ['./tabs-shell.component.scss'],
  standalone: false
})
export class TabsShellComponent implements OnInit {

  constructor(
    private modalController: ModalController,
    private budgetDataService: BudgetDataService
  ) { }

  ngOnInit() {}

  async onPlusButtonClick() {
    const modal = await this.modalController.create({
      component: AddTransactionModalComponent,
      cssClass: 'add-transaction-modal',
      breakpoints: [0, 0.5, 0.75, 1],
      initialBreakpoint: 0.75
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss<TransactionData>();
    if (role === 'confirm' && data) {
      // Validate transaction data
      if (this.isValidTransaction(data)) {
        const transaction: Transaction = {
          id: this.generateTransactionId(),
          type: data.type,
          amount: data.amount,
          category: data.category,
          categoryColor: data.categoryColor,
          description: data.description || '',
          date: data.date
        };

        // Save transaction to storage
        await this.budgetDataService.addTransaction(transaction);
        console.log('Transaction saved successfully:', transaction);
      } else {
        console.error('Invalid transaction data:', data);
      }
    }
  }

  private isValidTransaction(data: TransactionData): boolean {
    return !!(
      data.type &&
      data.category &&
      data.amount > 0 &&
      data.date
    );
  }

  private generateTransactionId(): string {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

}