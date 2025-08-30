import { Component, inject, signal } from '@angular/core';
import { ImageStateService } from '../image-state.service';

@Component({
  selector: 'app-textbox-output',
  imports: [],
  templateUrl: './textbox-output.component.html',
  styleUrl: './textbox-output.component.css'
})
export class TextboxOutputComponent {
  imageStateService = inject(ImageStateService);
}
