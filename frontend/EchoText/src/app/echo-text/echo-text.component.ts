import { Component, inject, OnInit } from '@angular/core';
import { WindowFrameComponent } from '../window-frame/window-frame.component';
import { ImagePreviewComponent } from '../image-preview/image-preview.component';
import { UploadImageComponent } from '../upload-image/upload-image.component';
import { FileImage, UploadImageService } from '../upload-image.service';
import { WebcamService } from '../webcam.service';

@Component({
  selector: 'app-echo-text',
  imports: [WindowFrameComponent, ImagePreviewComponent, UploadImageComponent],
  templateUrl: './echo-text.component.html',
  styleUrl: './echo-text.component.css'
})
export class EchoTextComponent implements OnInit {
  uploadImageService = inject(UploadImageService);
  webcamService = inject(WebcamService);

  ngOnInit(): void {}

}
