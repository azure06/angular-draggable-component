import { ElementRef, Directive, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription, fromEvent } from 'rxjs';

enum MouseStatus {
  MouseUp = 'mouseup',
  MouseDown = 'mousedown',
}

enum Direction {
  Top = 'TOP',
  TopRight = 'TOP_RIGHT',
  Right = 'RIGHT',
  BottomRight = 'BOTTOM_RIGHT',
  Bottom = 'BOTTOM',
  BottomLeft = 'BOTTOM_LEFT',
  Left = 'LEFT',
  TopLeft = 'TOP_LEFT',
  None = 'NONE',
}

@Directive({
  selector: '[resize]',
})
export class ResizeDirective implements OnInit, OnDestroy {
  @Input() width: string;
  @Input() height: string;
  eventStartX: number;
  eventStartY: number;
  elStartDomRect: DOMRect;
  elStartStyle: { top: number; left: number };
  resizeDirection: Direction = Direction.None;
  mouseStatus: MouseStatus;
  mouseDownSubscription: Subscription;
  mouseUpSubscription: Subscription;
  mouseMoveSubscription: Subscription;

  constructor(public element: ElementRef) {}

  ngOnInit(): void {
    const el: HTMLDivElement = this.element.nativeElement;
    const mouseMoveObservable = fromEvent(document, 'mousemove');
    const mouseDownObservable = fromEvent(document, 'mousedown');
    const mouseUpObservable = fromEvent(document, 'mouseup');
    const offset = 5;

    el.style.width = this.width;
    el.style.height = this.height;
    el.style.userSelect = 'none';

    this.mouseMoveSubscription = mouseMoveObservable.subscribe(
      (event: MouseEvent) => {
        const currentDirection = this.getResizeDirection(
          this.calculateDistanceFromCenter(el, event),
          offset,
        );

        this.setCursor(currentDirection);
        this.resize(event);
      },
    );

    this.mouseDownSubscription = mouseDownObservable.subscribe(
      (event: MouseEvent) => {
        this.eventStartX = event.clientX;
        this.eventStartY = event.clientY;
        this.elStartDomRect = el.getBoundingClientRect() as DOMRect;
        this.elStartStyle = {
          top: +el.style.top.slice(0, -2),
          left: +el.style.left.slice(0, -2),
        };
        this.mouseStatus = MouseStatus.MouseDown;
        this.resizeDirection = this.getResizeDirection(
          this.calculateDistanceFromCenter(el, event),
          offset,
        );
      },
    );

    this.mouseUpSubscription = mouseUpObservable.subscribe(
      (event: MouseEvent) => {
        this.mouseStatus = MouseStatus.MouseUp;
        this.resizeDirection = Direction.None;
        document.body.style.cursor = 'auto';
      },
    );
  }

  resize(event: MouseEvent) {
    const el: HTMLDivElement = this.element.nativeElement;
    const offsetWidth = event.clientX - this.eventStartX;
    const offsetHeight = event.clientY - this.eventStartY;

    const resize = {
      [Direction.Top]: () => {
        el.style.top = `${this.elStartStyle.top + offsetHeight}px`;
        el.style.height = `${this.elStartDomRect.height - offsetHeight}px`;
      },
      [Direction.Bottom]: () => {
        el.style.height = `${this.elStartDomRect.height + offsetHeight}px`;
      },
      [Direction.Left]: () => {
        el.style.left = `${this.elStartStyle.left + offsetWidth}px`;
        el.style.width = `${this.elStartDomRect.width - offsetWidth}px`;
      },
      [Direction.Right]: () => {
        el.style.width = `${this.elStartDomRect.width + offsetWidth}px`;
      },
      [Direction.TopLeft]: () => {
        resize[Direction.Top]();
        resize[Direction.Left]();
      },
      [Direction.BottomRight]: () => {
        resize[Direction.Bottom]();
        resize[Direction.Right]();
      },
      [Direction.TopRight]: () => {
        resize[Direction.Top]();
        resize[Direction.Right]();
      },
      [Direction.BottomLeft]: () => {
        resize[Direction.Bottom]();
        resize[Direction.Left]();
      },
      [Direction.None]: () => {},
    };

    resize[this.resizeDirection]();
  }

  setCursor(direction: Direction) {
    const setCursor = {
      [Direction.Top]: () => {
        document.body.style.cursor = 'n-resize';
      },
      [Direction.Bottom]: () => {
        document.body.style.cursor = 'n-resize';
      },
      [Direction.Left]: () => {
        document.body.style.cursor = 'e-resize';
      },
      [Direction.Right]: () => {
        document.body.style.cursor = 'e-resize';
      },
      [Direction.TopLeft]: () => {
        document.body.style.cursor = 'nw-resize';
      },
      [Direction.BottomRight]: () => {
        document.body.style.cursor = 'nw-resize';
      },
      [Direction.TopRight]: () => {
        document.body.style.cursor = 'ne-resize';
      },
      [Direction.BottomLeft]: () => {
        document.body.style.cursor = 'ne-resize';
      },
      [Direction.None]: () => {
        document.body.style.cursor = 'auto';
      },
    };
    setCursor[direction]();
  }

  getResizeDirection(
    {
      distanceX,
      directionX,
      distanceY,
      directionY,
    }: {
      distanceX: number;
      directionX: Direction;
      distanceY: number;
      directionY: Direction;
    },
    offset: number,
  ): Direction {
    if (
      distanceX < offset &&
      distanceX >= -offset &&
      distanceY < offset &&
      distanceY >= -offset
    ) {
      return directionY === Direction.Top
        ? directionX === Direction.Left
          ? Direction.TopLeft
          : Direction.TopRight
        : directionX === Direction.Left
        ? Direction.BottomLeft
        : Direction.BottomRight;
    } else if (distanceX < offset && distanceX > -offset && distanceY <= 0) {
      return directionX;
    } else if (distanceY < offset && distanceY > -offset && distanceX <= 0) {
      return directionY;
    } else {
      return Direction.None;
    }
  }

  calculateDistanceFromCenter(
    el: HTMLDivElement,
    event: MouseEvent,
  ): {
    distanceX: number;
    directionX: Direction;
    distanceY: number;
    directionY: Direction;
  } {
    const rect = el.getBoundingClientRect();
    const x = event.clientX - rect.left - el.clientWidth / 2;
    const y = event.clientY - rect.top - el.clientHeight / 2;

    return {
      ...(x >= 0
        ? {
            distanceX: x - el.clientWidth / 2,
            directionX: Direction.Right,
          }
        : {
            distanceX: Math.abs(x) - el.clientWidth / 2,
            directionX: Direction.Left,
          }),
      ...(y >= 0
        ? {
            distanceY: y - el.clientHeight / 2,
            directionY: Direction.Bottom,
          }
        : {
            distanceY: Math.abs(y) - el.clientHeight / 2,
            directionY: Direction.Top,
          }),
    };
  }

  ngOnDestroy(): void {
    this.mouseUpSubscription.unsubscribe();
    this.mouseDownSubscription.unsubscribe();
    this.mouseMoveSubscription.unsubscribe();
  }
}
