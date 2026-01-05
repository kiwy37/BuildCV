import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AtsTemplateComponent } from './ats-template.component';

describe('AtsTemplateComponent', () => {
  let component: AtsTemplateComponent;
  let fixture: ComponentFixture<AtsTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AtsTemplateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AtsTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
