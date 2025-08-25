import { Component, inject, OnInit } from '@angular/core';
import { WebcamService } from '../webcam.service';
import { FileImage, UploadImageService } from '../upload-image.service';

@Component({
  selector: 'app-image-preview',
  imports: [],
  templateUrl: './image-preview.component.html',
  styleUrl: './image-preview.component.css'
})
export class ImagePreviewComponent implements OnInit {
  //Services injected
  webcamService = inject(WebcamService);
  uploadImageService = inject(UploadImageService);

  imageDataURL!: string;
  imageFileName!: string;



  processedImage : FileImage = {
      image_file_id : 0,
      content_type: "",
      processed_text: "",
      file_name: "",
  };
  
  ngOnInit(): void {}

   getImagePreview(){
     this.imageDataURL = this.webcamService.previewImage();
     this.imageFileName = this.webcamService.imageFileName();
  }

/**
 * Send the request to server to process the image and return the response
 */
  processImageToText(){
    this.getImagePreview();
    this.uploadImageService.uploadFileToServer(this.imageDataURL, this.imageFileName)
    .subscribe({
      next: (result: FileImage) =>{
        console.log(result);
        console.log(result.processed_text);
        this.processedImage = result;
      },
      error: err => {
        console.error('Upload failed', err);
      }
    });
  }
}
