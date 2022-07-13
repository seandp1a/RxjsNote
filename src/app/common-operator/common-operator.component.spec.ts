import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonOperatorComponent } from './common-operator.component';

describe('CommonOperatorComponent', () => {
  let component: CommonOperatorComponent;
  let fixture: ComponentFixture<CommonOperatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommonOperatorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonOperatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
