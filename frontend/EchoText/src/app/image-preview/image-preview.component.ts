import { Component, inject } from '@angular/core';
import { WebcamService } from '../webcam.service';
import { UploadImageService } from '../upload-image.service';

@Component({
  selector: 'app-image-preview',
  imports: [],
  templateUrl: './image-preview.component.html',
  styleUrl: './image-preview.component.css'
})
export class ImagePreviewComponent {
  webcamService = inject(WebcamService);
  uploadImageService = inject(UploadImageService);
}
