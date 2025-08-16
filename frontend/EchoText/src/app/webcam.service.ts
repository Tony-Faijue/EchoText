import { Injectable, OnInit, signal } from '@angular/core';
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

  public errors = signal<WebcamInitError[]>([]);

  //Available Cameras
  public multipleWebcamsAvailable = signal(false);
  public deviceId = signal('');

  //Default Video Options
  public videoOptions: MediaTrackConstraints = {
    width: {min: 640, ideal: 1080, max: 1920},
    height: {min: 400, ideal: 1350, max: 1080},
    frameRate: {max: 60},
  }

  //Webcam settings
  public cameraSwitched = signal(true);
  public mirrorImage = signal('never');
  public allowCameraSwitch = signal(true);
  public showWebcam = signal(false);
  public isCameraExist = signal(true);
  public imageQuality = signal(1);
  
  public capturedImages = signal<WebcamImage[]>([]);
  public previewImage = signal('');

  constructor() { }

  public ngOnInit(): void {
  }

  /**
   * Initializes the cameras of the device
   */
  public initializeCameras():void {
    WebcamUtil.getAvailableVideoInputs()
    .then((mediaDevices: MediaDeviceInfo[]) =>{
      this.multipleWebcamsAvailable.set(mediaDevices && mediaDevices.length > 1);
      console.log('Available Cameras:', mediaDevices);
    })
    .catch(err =>{
      console.error('Error getting cameras:', err);
      this.errors.update(errors => [...errors, err]);
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
    this.errors.update(errors => [...errors, error]);
  }

  /**
   * 
   * @param webcamImage 
   * Add the captured image from the Webcam to caputredImages array
   */
  public handleImage(webcamImage: WebcamImage): void{
    console.log('Received webcam image', webcamImage);
    this.webcamImage = webcamImage;
    this.capturedImages.update(captured => [...captured, webcamImage]);
    this.previewImage.set(webcamImage.imageAsDataUrl);
  }

  public viewSnapShots(){
      console.log("Captured Images", this.capturedImages);
  }

  /**
   * Toggle WebCam On or Off
   */
  public toggleWebCam(): void{
    this.showWebcam.set(!this.showWebcam());
  }

  /**
   * 
   * @param deviceId 
   * Set the active camera
   */
  public setActiveDevice(deviceId: string):void{
    this.deviceId.set(deviceId);
    console.log('Active device:' + this.deviceId);
  }




}
