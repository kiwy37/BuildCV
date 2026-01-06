// preview.component.ts
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CvService } from '../cv.service';
import { CVData } from '../cv-data.model';
import { CustomizationSettings } from './templates/lima-template/lima-template.component';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.css']
})
export class PreviewComponent implements OnInit {
  @ViewChild('pagedSource', { static: false }) pagedSource!: ElementRef;
  cvData!: CVData;
  selectedTheme = 'lima';
  isLoading = false;
  showCustomizationPanel = true;

  zoom = 1; // 1 = 100%

  customization: CustomizationSettings = {
    fontSize: 14,
    lineHeight: 1.6,
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 0,
    paddingTop: 32,
    paddingBottom: 32,
    paddingLeft: 32,
    paddingRight: 32,
    primaryColor: '#4F46E5',
    secondaryColor: '#10B981',
    textColor: '#2D3748',
    backgroundColor: '#FFFFFF',
    borderColor: '#dcdfe4',
    headingColor: '#2a303c',
    sectionBgColor: '#f9fafb',
    headingFontSize: 24,
    sectionSpacing: 20,
    fontFamily: 'Roboto'
  };

  constructor(private cvService: CvService) {}

  ngOnInit(): void {
    this.cvData = this.cvService.getCVData();
    this.selectedTheme = (this.cvData as any).selectedTheme || 'lima';

    const saved = localStorage.getItem('cvCustomization');
    if (saved) {
      this.customization = JSON.parse(saved);
    }
  }

  toggleCustomizationPanel(): void {
    this.showCustomizationPanel = !this.showCustomizationPanel;
  }

  setZoom(value: string | number): void {
    const v = Number(value);
    if (!isNaN(v)) {
      this.zoom = Math.max(0.5, Math.min(2, v / 100));
    }
  }

  onCustomizationChange(): void {
    localStorage.setItem('cvCustomization', JSON.stringify(this.customization));
  }

  resetCustomization(): void {
    localStorage.removeItem('cvCustomization');
    this.ngOnInit();
  }

  downloadPDF(): void {
    this.isLoading = true;
    // Revert to original signature: don't send customization to backend as it causes 500/Corruption
    this.cvService.exportToPdf(this.cvData, this.selectedTheme).subscribe({
      next: (blob) => {
        // Strict check: if it's not PDF (e.g. JSON error or HTML 500 page), fail gracefully
        if (blob.type !== 'application/pdf') {
          const reader = new FileReader();
          reader.onload = () => {
             // Try to parse as JSON error
             try {
                const msg = JSON.parse(reader.result as string);
                alert('Export failed: ' + (msg.message || msg.error || 'Server returned invalid data format.'));
             } catch(e) {
                // If not JSON, it's likely an HTML error page from the server
                console.error('Non-PDF response:', reader.result);
                alert('Export failed. Server returned an error page instead of PDF.');
             }
             this.isLoading = false;
          };
          reader.readAsText(blob);
          return;
        }

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `CV-${(this.cvData.personalInfo.fullName || 'Export').replace(/\s+/g, '_')}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('PDF Export failed', err);
        this.isLoading = false;
        
        if (err.error instanceof Blob) {
           const reader = new FileReader();
           reader.onload = () => {
             try {
               const msg = JSON.parse(reader.result as string);
               alert('Server error: ' + (msg.message || msg.error || 'Unknown server error'));
             } catch {
               alert('Server returned an error.');
             }
           };
           reader.readAsText(err.error);
        } else {
           alert('Could not download PDF. Server might be offline or encountering an issue.');
        }
      }
    });
  }

  backToThemeSelection(): void {
    this.cvService.setCurrentStep(8);
  }

  getPreviewStyles(): any {
    return {
      'transform': `scale(${this.zoom})`,
      'transform-origin': 'top center',
      'transition': 'transform 0.2s ease'
    };
  }
}