import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorialRecepcionComponent } from './historial-recepcion.component';

describe('HistorialRecepcionComponent', () => {
  let component: HistorialRecepcionComponent;
  let fixture: ComponentFixture<HistorialRecepcionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistorialRecepcionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistorialRecepcionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
