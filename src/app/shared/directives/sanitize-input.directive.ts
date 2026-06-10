import { Directive, HostListener, ElementRef, inject } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: 'textarea[appSanitizeInput], input[appSanitizeInput]',
  standalone: true
})
export class SanitizeInputDirective {
  private el = inject(ElementRef);
  private control = inject(NgControl, { optional: true });

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const inputElement = this.el.nativeElement as HTMLTextAreaElement | HTMLInputElement;
    const originalValue = inputElement.value;

    // 1. Clean HTML tags / script Injection: Strip `<` and `>`
    let sanitized = originalValue.replace(/[<>]/g, '');

    // 2. Clean common SQL Injection patterns:
    // - Replace double hyphens `--` (SQL comment) with a single hyphen `-`
    // - Remove semicolons (which terminate SQL commands) if followed by letters/spaces
    sanitized = sanitized.replace(/--+/g, '-');
    
    // - Remove backslashes `\` to prevent escaping tricks
    sanitized = sanitized.replace(/\\/g, '');

    if (originalValue !== sanitized) {
      // Sync value with Angular Form Control if present
      if (this.control?.control) {
        this.control.control.setValue(sanitized, { emitEvent: false });
      }
    }
  }
}
