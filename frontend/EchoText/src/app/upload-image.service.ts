import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { WebcamService } from './webcam.service';

/**
 * An interface that represents the response returned from the server after processing the image
 */
export interface FileImage{
  image_file_id: number,
  content_type: string,
  processed_text: string,
  file_name: string,
}

@Injectable({
  providedIn: 'root'
})

export class UploadImageService {

  //inject HTTPClient and Webcam Services
  http = inject(HttpClient);
  webcamService = inject(WebcamService);


  baseURL = "http://127.0.0.1:9999/api/process-images";


 //Testing API with fake data
 // userList: any[] = [];

  /**
  *  Upload the file image to the POST URI endpoint, to process the image on the server
  * @param file 
  * @returns 
  */
  uploadFileToServer(dataUrl: string, filename: string): Observable<FileImage>{
    const file = this.dataURLToFile(dataUrl, filename);
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<FileImage>(this.baseURL, formData);
 }

 /**
  * Function to convert image data url to a file object to be processed on the server
  * @param dataUrl 
  * @param filename 
  * @returns a file object
  */
 dataURLToFile(dataUrl: string, filename:string):File{
  //For the allowes file types
  const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png'];

  //Split data url into metadata
  const [header, base64] = dataUrl.split(",");
  //Extract MIME Type
  const mimeMatch = header.match(/data:(.+);base64/);
  const mime = mimeMatch ? mimeMatch[1] : '';

  //Validate against the allowed type
  if(!ALLOWED_MIME_TYPES.includes(mime)){
    throw new Error(`Unsupported MIME type: ${mime}`);
  }

  //Decode base64 to a binary string
  const binary = atob(base64);
  //Build Uint8Array for raw bytes
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++){
    array[i] = binary.charCodeAt(i);
  }

  //Add filename with extension if not included
  const ext = mime.split('/')[1];
  const validFileName = filename.includes('.') ? filename : `${filename}.${ext}`;
  
  //Return the file object
  return new File([array], validFileName, {type: mime});
 }

}
