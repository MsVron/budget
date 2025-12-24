import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { WeeklyCategoryEntriesModalComponent } from './weekly-category-entries-modal.component';

describe('WeeklyCategoryEntriesModalComponent', () => {
  let component: WeeklyCategoryEntriesModalComponent;
  let fixture: ComponentFixture<WeeklyCategoryEntriesModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WeeklyCategoryEntriesModalComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(WeeklyCategoryEntriesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

