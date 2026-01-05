import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CustomizationSettings } from '../templates/lima-template.component';

@Component({
  selector: 'app-customize-menu',
  templateUrl: './customize-menu.component.html',
  styleUrls: ['./customize-menu.component.css']
})
export class CustomizeMenuComponent implements OnInit {
  @Input() customization!: Partial<CustomizationSettings>;
  @Input() show: boolean = true;
  @Input() zoomPercent: number = 100;

  @Output() customizationChange = new EventEmitter<void>();
  @Output() zoomChange = new EventEmitter<number>();
  @Output() reset = new EventEmitter<void>();
  @Output() exportPdf = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();

  activeTab: 'colors' | 'text' | 'spacing' | 'borders' = 'colors';

  // List of fonts for the dropdown
  fontOptions: string[] = [
    'Roboto', 'Lato', 'Montserrat', 'Open Sans', 
    'Raleway', 'Caladea', 'Lora', 'Roboto Slab', 
    'Playfair Display', 'Merriweather'
  ];

  ngOnInit(): void {
    if (!this.customization) {
      this.customization = {};
    }
    this.applyDefaults();
  }

  applyDefaults() {
    const defaults: Partial<CustomizationSettings> = {
      fontSize: 16,
      headingFontSize: 18,
      lineHeight: 1.8,
      sectionSpacing: 20,
      marginLeft: 30,
      marginTop: 20,
      paddingLeft: 30,
      paddingRight: 30,
      primaryColor: '#2563EB',
      secondaryColor: '#10B981',
      textColor: '#111827',
      backgroundColor: '#FFFFFF',
      borderColor: '#E5E7EB',
      headingColor: '#111827',
      sectionBgColor: '#ffffff',
      fontFamily: 'Lora'
    };
    // Merge defaults with existing customization
    this.customization = { ...(defaults as any), ...(this.customization as any) };
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
    // Re-apply defaults visually if the parent doesn't instantly replace the object
    setTimeout(() => this.applyDefaults(), 50); 
  }
  
  doExport(): void { this.exportPdf.emit(); }
  doBack(): void { this.back.emit(); }

  selectTab(tab: 'colors' | 'text' | 'spacing' | 'borders'): void {
    this.activeTab = tab;
  }
}