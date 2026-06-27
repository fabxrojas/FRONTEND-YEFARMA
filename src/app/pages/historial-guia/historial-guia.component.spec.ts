import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidarGuiaComponent } from './historial-guia.component';

describe('ValidarGuiaComponent', () => {
  let component: ValidarGuiaComponent;
  let fixture: ComponentFixture<ValidarGuiaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValidarGuiaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ValidarGuiaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
