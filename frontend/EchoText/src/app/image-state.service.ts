import { Injectable, OnInit, signal } from '@angular/core';
import { FileImage } from './upload-image.service';

@Injectable({
  providedIn: 'root'
})
export class ImageStateService implements OnInit {

  /**
   * Stores the data of the processed image
   */
  processedImage = signal<FileImage> ({
      image_file_id : 0,
      content_type: "",
      processed_text: "Resulting Text to Display After Processing Image.",
      file_name: "",
  });
  ngOnInit(): void {}
}
