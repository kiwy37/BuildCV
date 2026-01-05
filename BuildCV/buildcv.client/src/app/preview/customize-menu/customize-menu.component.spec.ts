import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomizeMenuComponent } from './customize-menu.component';

describe('CustomizeMenuComponent', () => {
  let component: CustomizeMenuComponent;
  let fixture: ComponentFixture<CustomizeMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomizeMenuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomizeMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
