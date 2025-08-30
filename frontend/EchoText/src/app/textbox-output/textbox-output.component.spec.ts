import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextboxOutputComponent } from './textbox-output.component';

describe('TextboxOutputComponent', () => {
  let component: TextboxOutputComponent;
  let fixture: ComponentFixture<TextboxOutputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextboxOutputComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TextboxOutputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
