import { Directive, HostListener, Input, ElementRef, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appAccessibleClick]'
})
export class AccessibleClickDirective {
  @Input() appAccessibleClick: () => void = () => {}; // Provide default empty function

  constructor(private readonly el: ElementRef, private readonly renderer: Renderer2) {
    this.renderer.setAttribute(this.el.nativeElement, 'tabindex', '0');
    this.renderer.setAttribute(this.el.nativeElement, 'role', 'button');
  }

  @HostListener('click')
  onClick() {
    this.appAccessibleClick();
  }

  @HostListener('keydown.enter')
  @HostListener('keydown.space')
  onKeyDown(event: KeyboardEvent) {
    event.preventDefault(); // Prevent default spacebar scroll behavior
    this.appAccessibleClick();
  }
}