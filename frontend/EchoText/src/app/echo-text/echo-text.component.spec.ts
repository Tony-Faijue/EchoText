import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EchoTextComponent } from './echo-text.component';

describe('EchoTextComponent', () => {
  let component: EchoTextComponent;
  let fixture: ComponentFixture<EchoTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EchoTextComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EchoTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
