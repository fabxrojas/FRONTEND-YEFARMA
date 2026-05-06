import { TestBed } from '@angular/core/testing';

import { IngresoProductoService } from './ingreso-producto.service';

describe('IngresoProductoService', () => {
  let service: IngresoProductoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IngresoProductoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
