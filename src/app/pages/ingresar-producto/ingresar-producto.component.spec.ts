import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IngresarProductoComponent } from './ingresar-producto.component';

describe('IngresarProductoComponent', () => {
  let component: IngresarProductoComponent;
  let fixture: ComponentFixture<IngresarProductoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IngresarProductoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IngresarProductoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
