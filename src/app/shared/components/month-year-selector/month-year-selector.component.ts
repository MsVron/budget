import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

export interface MonthYear {
  month: string;
  year: number;
}

@Component({
  selector: 'app-month-year-selector',
  templateUrl: './month-year-selector.component.html',
  styleUrls: ['./month-year-selector.component.scss'],
  standalone: false
})
export class MonthYearSelectorComponent implements OnInit {
  @Input() currentMonth!: string;
  @Input() currentYear!: number;
  @Output() monthYearChange = new EventEmitter<MonthYear>();

  months: string[] = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  ngOnInit() {
    if (!this.currentMonth || !this.currentYear) {
      const now = new Date();
      this.currentMonth = now.toLocaleString('en-US', { month: 'long' });
      this.currentYear = now.getFullYear();
    }
  }

  previousMonth() {
    const currentIndex = this.months.indexOf(this.currentMonth);
    if (currentIndex === 0) {
      this.currentMonth = this.months[11];
      this.currentYear--;
    } else {
      this.currentMonth = this.months[currentIndex - 1];
    }
    this.emitChange();
  }

  nextMonth() {
    const currentIndex = this.months.indexOf(this.currentMonth);
    if (currentIndex === 11) {
      this.currentMonth = this.months[0];
      this.currentYear++;
    } else {
      this.currentMonth = this.months[currentIndex + 1];
    }
    this.emitChange();
  }

  private emitChange() {
    this.monthYearChange.emit({
      month: this.currentMonth,
      year: this.currentYear
    });
  }

  get displayText(): string {
    return `${this.currentMonth} ${this.currentYear}`;
  }
}

