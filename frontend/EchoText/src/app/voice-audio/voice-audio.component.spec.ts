import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VoiceAudioComponent } from './voice-audio.component';

describe('VoiceAudioComponent', () => {
  let component: VoiceAudioComponent;
  let fixture: ComponentFixture<VoiceAudioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VoiceAudioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VoiceAudioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
