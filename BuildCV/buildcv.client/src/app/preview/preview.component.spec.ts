import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomizeMenuComponent } from './customize-menu/customize-menu.component';

import { PreviewComponent } from './preview.component';

describe('PreviewComponent', () => {
  let component: PreviewComponent;
  let fixture: ComponentFixture<PreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PreviewComponent, CustomizeMenuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
