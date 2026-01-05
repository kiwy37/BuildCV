import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RotterdamTemplateComponent } from './rotterdam-template.component';

describe('RotterdamTemplateComponent', () => {
  let component: RotterdamTemplateComponent;
  let fixture: ComponentFixture<RotterdamTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RotterdamTemplateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RotterdamTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
