import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MonthlyBudgetPage } from './monthly-budget.page';

describe('MonthlyBudgetPage', () => {
  let component: MonthlyBudgetPage;
  let fixture: ComponentFixture<MonthlyBudgetPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MonthlyBudgetPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
