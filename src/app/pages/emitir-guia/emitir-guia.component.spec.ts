import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearGuiaComponent } from './emitir-guia.component';

describe('CrearGuiaComponent', () => {
  let component: CrearGuiaComponent;
  let fixture: ComponentFixture<CrearGuiaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearGuiaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearGuiaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
