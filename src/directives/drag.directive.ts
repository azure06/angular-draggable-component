import {
  ElementRef,
  Directive,
  OnInit,
  OnDestroy,
  Renderer2,
} from '@angular/core';
import { Subscription, fromEvent } from 'rxjs';

enum MouseStatus {
  MouseUp = 'mouseup',
  MouseDown = 'mousedown',
}

@Directive({
  selector: '[drag]',
})
export class DragDirective implements OnInit, OnDestroy {
  clientX: number;
  clientY: number;
  offset: number;

  mouseStatus: MouseStatus;
  mouseUpSubscription: Subscription;
  mouseMoveSubscription: Subscription;

  constructor(public element: ElementRef, private renderer: Renderer2) {}

  ngOnInit(): void {
    const mouseUpObservable = fromEvent(document, 'mouseup');
    const mouseMoveObservable = fromEvent(document, 'mousemove');
    this.mouseUpSubscription = mouseUpObservable.subscribe(event => {
      this.mouseStatus = MouseStatus.MouseUp;
    });
    this.mouseMoveSubscription = mouseMoveObservable.subscribe(
      (event: MouseEvent) => {
        if (this.mouseStatus === MouseStatus.MouseDown) {
          const x = event.clientX - this.clientX;
          const y = event.clientY - this.clientY;
          this.move({ x, y });
          this.clientX = event.clientX;
          this.clientY = event.clientY;
        }
      },
    );

    const el: HTMLDivElement = this.element.nativeElement;
    const innerEl = document.createElement('div');
    const ngContentEl = el.firstChild;
    el.insertBefore(innerEl, ngContentEl);
    innerEl.appendChild(ngContentEl);
    innerEl.onmousedown = event => {
      this.mouseStatus = MouseStatus.MouseDown;
      this.clientX = event.clientX;
      this.clientY = event.clientY;
    };
    this.renderer.addClass(innerEl, 'wrapper');
    this.renderer.addClass(el, 'content');

    // Object.assign(wrapper.style, {
    //   backgroundColor: 'rgba(240, 240, 240, 1)',
    //   width: 'calc(100% - 10px)',
    //   height: 'calc(100% - 10px)',
    //   margin: '5px',
    // });
    // Object.assign(el.style, {
    //   position: 'absolute',
    //   overflow: 'auto',
    //   top: '0px',
    //   left: '0px',
    //   boxShadow: '0px 0px 10px 2px rgba(89, 89, 89, .5)',
    //   borderRadius: '3px',
    // });
  }

  move({ x, y }: { x: number; y: number }) {
    const parentEl = (this.element.nativeElement as HTMLDivElement)
      .parentElement;
    const parentDomRect: DOMRect = parentEl.getClientRects()[0] as DOMRect;
    const elDomRect: DOMRect = (this.element
      .nativeElement as HTMLDivElement).getClientRects()[0] as DOMRect;

    const canvasTop = parentDomRect.top;
    const canvasHeight = parentDomRect.height;
    const canvasLeft = parentDomRect.left;
    const canvasWidth = parentDomRect.width;

    const top = +this.element.nativeElement.style.top.slice(0, -2);
    const left = +this.element.nativeElement.style.left.slice(0, -2);

    const nextTop =
      top + elDomRect.height + y > parentDomRect.height
        ? canvasHeight - elDomRect.height
        : top + y < canvasTop
        ? 0
        : top + y;

    const nextLeft =
      left + elDomRect.width + x > canvasWidth
        ? canvasWidth - elDomRect.width
        : left + x < canvasLeft
        ? 0
        : left + x;

    this.element.nativeElement.style.top = `${nextTop}px`;
    this.element.nativeElement.style.left = `${nextLeft}px`;
  }

  ngOnDestroy(): void {
    this.mouseUpSubscription.unsubscribe();
    this.mouseMoveSubscription.unsubscribe();
  }
}
