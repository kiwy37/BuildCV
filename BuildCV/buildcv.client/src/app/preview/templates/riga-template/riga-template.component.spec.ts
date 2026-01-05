import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RigaTemplateComponent } from './riga-template.component';

describe('RigaTemplateComponent', () => {
  let component: RigaTemplateComponent;
  let fixture: ComponentFixture<RigaTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RigaTemplateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RigaTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
