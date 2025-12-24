import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AddTransactionModalComponent } from '../../shared/modals/add-transaction-modal/add-transaction-modal.component';

@Component({
  selector: 'app-tabs-shell',
  templateUrl: './tabs-shell.component.html',
  styleUrls: ['./tabs-shell.component.scss'],
  standalone: false
})
export class TabsShellComponent implements OnInit {

  constructor(private modalController: ModalController) { }

  ngOnInit() {}

  async onPlusButtonClick() {
    const modal = await this.modalController.create({
      component: AddTransactionModalComponent,
      cssClass: 'add-transaction-modal',
      breakpoints: [0, 0.5, 0.75, 1],
      initialBreakpoint: 0.75
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirm' && data) {
      console.log('Transaction data:', data);
      // TODO: Save transaction data using your service
      // Example: this.transactionService.addTransaction(data);
    }
  }

}