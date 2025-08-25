import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { EchoTextComponent } from './echo-text/echo-text.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, EchoTextComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'EchoText';
}
