import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExpensesIncomePage } from './expenses-income.page';

describe('ExpensesIncomePage', () => {
  let component: ExpensesIncomePage;
  let fixture: ComponentFixture<ExpensesIncomePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpensesIncomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
