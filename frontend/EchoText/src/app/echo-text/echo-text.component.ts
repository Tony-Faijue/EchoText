import { Component } from '@angular/core';
import { WindowFrameComponent } from '../window-frame/window-frame.component';

@Component({
  selector: 'app-echo-text',
  imports: [WindowFrameComponent],
  templateUrl: './echo-text.component.html',
  styleUrl: './echo-text.component.css'
})
export class EchoTextComponent {

}
