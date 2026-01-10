import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CustomizationSettings } from '../templates/lima-template/lima-template.component';

@Component({
  selector: 'app-customize-menu',
  templateUrl: './customize-menu.component.html',
  styleUrls: ['./customize-menu.component.css']
})
export class CustomizeMenuComponent implements OnInit {
  @Input() customization!: Partial<CustomizationSettings>;
  @Input() show: boolean = true;
  @Input() zoomPercent: number = 100;
  @Input() selectedTheme: string = '';

  @Output() customizationChange = new EventEmitter<void>();
  @Output() zoomChange = new EventEmitter<number>();
  @Output() reset = new EventEmitter<void>();
  @Output() exportPdf = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();

  activeTab: 'colors' | 'text' | 'spacing' = 'colors';

  // List of fonts for the dropdown
  fontOptions: string[] = [
    'Roboto', 'Lato', 'Montserrat', 'Open Sans', 
    'Raleway', 'Caladea', 'Lora', 'Roboto Slab', 
    'Playfair Display', 'Merriweather'
  ];

  ngOnInit(): void {
    if (!this.customization) {
      // In normal flow the parent provides the object.
      // If not provided, create one.
      this.customization = {};
    }
    this.applyDefaults();
  }

  applyDefaults() {
    const defaults: Partial<CustomizationSettings> = {
      fontSize: 16,
      headingFontSize: 25,
      lineHeight: 1.5,
      sectionSpacing: 27,
      marginLeft: 30,
      marginTop: 30,
      paddingLeft: 30,
      paddingRight: 30,
      primaryColor: '#4F46E5',
      secondaryColor: '#000000',
      textColor: '#2D3748',
      backgroundColor: '#FFFFFF',
      borderColor: '#dcdfe4',
      headingColor: '#2a303c',
      sectionBgColor: '#f9fafb',
      atsThemeColor: '#eef6ff',
      fontFamily: 'Roboto'
    };

    // Merge defaults with existing customization WITHOUT replacing the reference.
    // Replacing the object breaks the parent binding, so changes wouldn't reflect in the CV.
    const merged = { ...(defaults as any), ...(this.customization as any) };
    Object.assign(this.customization as any, merged);
  }

  onCustomizationInput(): void {
    localStorage.setItem('cvCustomization', JSON.stringify(this.customization || {}));
    this.customizationChange.emit();
  }

  onZoomInput(value: string | number): void {
    const v = Number(value);
    if (!isNaN(v)) {
      this.zoomChange.emit(v);
    }
  }

  doReset(): void {
    this.reset.emit();
  }
  
  doExport(): void { this.exportPdf.emit(); }
  doBack(): void { this.back.emit(); }

  selectTab(tab: 'colors' | 'text' | 'spacing'): void {
    this.activeTab = tab;
  }
}