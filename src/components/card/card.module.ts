import { NgModule } from '@angular/core';
import { CardComponent } from './card.component';
import { ResizeDirective } from '../../directives/resize.directive';
import { DragDirective } from '../../directives/drag.directive';

@NgModule({
  declarations: [CardComponent, DragDirective, ResizeDirective],
  exports: [CardComponent, DragDirective, ResizeDirective],
})
export class CardModule {}
