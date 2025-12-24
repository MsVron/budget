import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { AddTransactionModalComponent } from './add-transaction-modal.component';

describe('AddTransactionModalComponent', () => {
  let component: AddTransactionModalComponent;
  let fixture: ComponentFixture<AddTransactionModalComponent>;
  let modalController: ModalController;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddTransactionModalComponent ],
      imports: [IonicModule.forRoot(), ReactiveFormsModule],
      providers: [ModalController]
    }).compileComponents();

    fixture = TestBed.createComponent(AddTransactionModalComponent);
    component = fixture.componentInstance;
    modalController = TestBed.inject(ModalController);
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values', () => {
    expect(component.transactionForm.get('type')?.value).toBe('expense');
    expect(component.transactionForm.get('category')?.value).toBe('');
    expect(component.transactionForm.get('amount')?.value).toBe('');
  });

  it('should validate required fields', () => {
    expect(component.transactionForm.valid).toBeFalsy();
    
    component.transactionForm.patchValue({
      category: 'Food & Dining',
      amount: 50
    });
    
    expect(component.transactionForm.valid).toBeTruthy();
  });

  it('should switch categories when type changes', () => {
    expect(component.categories).toEqual(component.expenseCategories);
    
    component.transactionForm.patchValue({ type: 'income' });
    
    expect(component.categories).toEqual(component.incomeCategories);
  });
});