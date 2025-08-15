import { Component } from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-upload-image',
  imports: [ReactiveFormsModule],
  templateUrl: './upload-image.component.html',
  styleUrl: './upload-image.component.css'
})
export class UploadImageComponent {

  imageData: FormGroup = new FormGroup({
    imageFile: new FormControl(''),
  });

  public onFormSubmit():void{
    let formData = this.imageData.value;
    console.log(formData);
  }
}
