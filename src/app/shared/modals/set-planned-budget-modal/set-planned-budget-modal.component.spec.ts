import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SetPlannedBudgetModalComponent } from './set-planned-budget-modal.component';

describe('SetPlannedBudgetModalComponent', () => {
  let component: SetPlannedBudgetModalComponent;
  let fixture: ComponentFixture<SetPlannedBudgetModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SetPlannedBudgetModalComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SetPlannedBudgetModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

