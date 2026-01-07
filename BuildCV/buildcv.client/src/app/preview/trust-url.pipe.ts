import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Pipe({
  name: 'trustUrl'
})
export class TrustUrlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(url: string | SafeResourceUrl | null): SafeResourceUrl | null {
    if (!url) return null;
    if (typeof url !== 'string') {
      return url;
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}