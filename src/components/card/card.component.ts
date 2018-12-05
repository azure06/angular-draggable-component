import { Component, Input } from '@angular/core';

@Component({
  selector: 'ard-card',
  template: `
    <div class="card"><ng-content> </ng-content></div>
  `,
})
export class CardComponent {}
