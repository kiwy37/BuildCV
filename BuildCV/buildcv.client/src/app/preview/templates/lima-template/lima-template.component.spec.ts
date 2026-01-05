import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LimaTemplateComponent } from './lima-template.component';

describe('LimaTemplateComponent', () => {
  let component: LimaTemplateComponent;
  let fixture: ComponentFixture<LimaTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LimaTemplateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LimaTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
