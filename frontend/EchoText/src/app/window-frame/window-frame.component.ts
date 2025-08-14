import { Component, inject, OnInit } from '@angular/core';
import {WebcamModule} from 'ngx-webcam';
import { WebcamService } from '../webcam.service';

@Component({
  selector: 'app-window-frame',
  imports: [WebcamModule],
  templateUrl: './window-frame.component.html',
  styleUrl: './window-frame.component.css'
})
export class WindowFrameComponent implements OnInit {
  //Inject Webcam Service
  webcamService = inject(WebcamService);

  //Get states from webcam service

  
  public ngOnInit(){ 
    // this.webcamService.initializeCameras();
  }

  public toggleCamera(){
    this.webcamService.toggleWebCam();
    if (this.webcamService.showWebcam()) {
      this.webcamService.initializeCameras();
    }
  }

  public captureImage(){
    
  }

  
}
