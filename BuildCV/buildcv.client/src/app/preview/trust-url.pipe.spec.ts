import { TrustUrlPipe } from './trust-url.pipe';
import { DomSanitizer } from '@angular/platform-browser';

describe('TrustUrlPipe', () => {
  it('create an instance', () => {
    const mockSanitizer = {
      bypassSecurityTrustResourceUrl: (url: string) => url
    } as unknown as DomSanitizer;
    const pipe = new TrustUrlPipe(mockSanitizer);
    expect(pipe).toBeTruthy();
  });
});
