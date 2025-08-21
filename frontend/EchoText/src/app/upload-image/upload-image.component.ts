import { Component, inject, signal } from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import { WebcamService } from '../webcam.service';

@Component({
  selector: 'app-upload-image',
  imports: [ReactiveFormsModule],
  templateUrl: './upload-image.component.html',
  styleUrl: './upload-image.component.css'
})
export class UploadImageComponent {

  webcamService = inject(WebcamService);


  imageData: FormGroup = new FormGroup({
    imageFile: new FormControl<File | null>(null),
  });

 
  public onFileSelected(event: Event){
    let input = event.target as HTMLInputElement;
    let file = input.files?.[0] ?? null;
    this.imageData.get('imageFile')!.setValue(file);
  }

  public async onFormSubmit():Promise<void>{
    let file: File | null = this.imageData.value.imageFile;
    console.log(file);
    if(!(file instanceof Blob)) {
      throw new Error("Expected Type must be of Blob/File. " + "Your given type of "+typeof file + " does not match.")
    }
    try{
      //pause and wait until fileToDataUrl function return a promise
    let dataUrl:string  = await this.fileToDataUrl(file);
    console.log("WebcamImage Uploade:", dataUrl);
    this.webcamService.previewImage.set(dataUrl);
  } catch (err) {
    console.log("Error Recieving Promise String", err);
  }
  }
/**
 * A function to read local file image that returns a promise
 * @param file 
 * @returns a promise string of the image file as a data url 
 */
  public fileToDataUrl(file: File):Promise<string>{
    return new Promise((resolve, reject) => {
      //Create a file reader object to read contents of the file
    let fileReader = new FileReader();
    //Calls the onload function of the file reader to get the aysnc result and resolve it as a string
      fileReader.onload = () =>{
        resolve(fileReader.result as string);
    };
    //Report error in file reading
    fileReader.onerror = () =>{
      reject(fileReader.error);
    };
    //read the file
    fileReader.readAsDataURL(file);
    });
  }
}
