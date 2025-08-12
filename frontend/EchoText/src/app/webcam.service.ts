import { Injectable, OnInit } from '@angular/core';
import { WebcamImage, WebcamInitError, WebcamUtil } from 'ngx-webcam';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebcamService implements OnInit {
  
  //Webcam snapshot trigger
  private trigger: Subject<void> = new Subject();
  //Switch to next/previous camera
  private nextWebcam: Subject<any> = new Subject();
  //Latest snapshot
  private webcamImage: WebcamImage|null = null;

  public errors: WebcamInitError[] =[];

  //Available Cameras
  public multipleWebcamsAvailable = false;
  public deviceId: string = '';

  //Default Video Options
  public videoOptions: MediaTrackConstraints = {
    width: {ideal: 1024},
    height: {ideal: 576}
  }

  //Webcam settings
  public cameraSwitched = false;
  public mirrorImage = 'never';
  public allowCameraSwitch = true;
  public showWebcam = true;
  public isCameraExist = true;
  
  public capturedImages: WebcamImage[] = [];

  constructor() { }

  public ngOnInit(): void {
    this.initializeCameras();
  }

  /**
   * Initializes the cameras of the device
   */
  public initializeCameras():void {
    WebcamUtil.getAvailableVideoInputs()
    .then((mediaDevices: MediaDeviceInfo[]) =>{
      this.multipleWebcamsAvailable = mediaDevices && mediaDevices.length > 1 ;
      console.log('Available Cameras:', mediaDevices);
    })
    .catch(err =>{
      console.error('Error getting cameras:', err);
      this.errors.push(err);
    });
  }

  /**
   * 
   * @returns the trigger property as an Observable
   */
  public getTriggerObservable(): Observable<void>{
    return this.trigger.asObservable();
  }

  /**
   * 
   * @returns the nextWebcam property as an Observable
   */
  public getNextWebCamObservable(): Observable<boolean|string>{
    return this.nextWebcam.asObservable();
  }

  /**
   * Takes a snapshot image of the Webcam
   */
  public triggerSnapShot(): void{
    this.trigger.next();
  }

  /**
   * 
   * @param directionOrDeviceId 
   * Switches to next specified Camera
   */
  public switchCamera(directionOrDeviceId: boolean|string):void{
    this.nextWebcam.next(directionOrDeviceId);
  }

  /**
   * 
   * @param error 
   * Log errors with the Webcam
   */
  public handleInitError(error: WebcamInitError):void{
    console.error('Webcam init error:', error);
    this.errors.push(error);
  }

  /**
   * 
   * @param webcamImage 
   * Add the captured image from the Webcam to caputredImages array
   */
  public handleImage(webcamImage: WebcamImage): void{
    console.log('Received webcam image', webcamImage);
    this.webcamImage = webcamImage;
    this.capturedImages.push(this.webcamImage);
  }

  /**
   * Toggle WebCam On or Off
   */
  public toggleWebCam(): void{
    this.showWebcam = !this.showWebcam;
  }

  /**
   * 
   * @param deviceId 
   * Set the active camera
   */
  public setActiveDevice(deviceId: string):void{
    this.deviceId = deviceId;
    console.log('Active device:' + this.deviceId);
  }



}
