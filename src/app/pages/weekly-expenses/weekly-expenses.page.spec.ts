import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WeeklyExpensesPage } from './weekly-expenses.page';

describe('WeeklyExpensesPage', () => {
  let component: WeeklyExpensesPage;
  let fixture: ComponentFixture<WeeklyExpensesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(WeeklyExpensesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
