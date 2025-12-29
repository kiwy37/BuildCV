import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChooseThemeComponent } from './choose-theme.component';

describe('ChooseThemeComponent', () => {
  let component: ChooseThemeComponent;
  let fixture: ComponentFixture<ChooseThemeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChooseThemeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChooseThemeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
