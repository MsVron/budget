import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Transaction, Expense } from '@models/budget.model';

export interface CategoryEntry {
  id: string;
  description: string;
  amount: number;
  date: Date;
  originalEntry?: Transaction | Expense;
}

@Component({
  selector: 'app-weekly-category-entries-modal',
  templateUrl: './weekly-category-entries-modal.component.html',
  styleUrls: ['./weekly-category-entries-modal.component.scss'],
  standalone: false
})
export class WeeklyCategoryEntriesModalComponent implements OnInit {
  @Input() categoryName: string = '';
  @Input() categoryColor: string = '#95A5A6';
  @Input() weekNumber: number = 1;
  @Input() weekStartDate: Date = new Date();
  @Input() weekEndDate: Date = new Date();
  @Input() entries: (Transaction | Expense)[] = [];

  displayEntries: CategoryEntry[] = [];

  constructor(private modalController: ModalController) { }

  ngOnInit() {
    this.displayEntries = this.entries.map(entry => ({
      id: entry.id,
      description: entry.description || 'No description',
      amount: entry.amount,
      date: new Date(entry.date),
      originalEntry: entry // Store the original entry for proper deletion/editing
    }));

    // Sort by date, most recent first
    this.displayEntries.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  formatCurrency(amount: number): string {
    return `dh${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }

  formatDateRange(): string {
    const start = new Date(this.weekStartDate);
    const end = new Date(this.weekEndDate);
    
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const startStr = start.toLocaleDateString('en-US', options);
    const endStr = end.toLocaleDateString('en-US', options);
    
    return `${startStr} - ${endStr}`;
  }

  getTotalAmount(): number {
    return this.displayEntries.reduce((sum, entry) => sum + entry.amount, 0);
  }

  onClose() {
    this.modalController.dismiss();
  }

  onEditEntry(entry: CategoryEntry) {
    // Close modal and pass the original entry to edit
    this.modalController.dismiss({
      action: 'edit',
      entry: entry.originalEntry || entry
    });
  }

  onDeleteEntry(entry: CategoryEntry) {
    // Close modal and pass the original entry to delete
    this.modalController.dismiss({
      action: 'delete',
      entry: entry.originalEntry || entry
    });
  }
}

